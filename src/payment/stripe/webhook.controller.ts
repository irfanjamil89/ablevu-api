import { Controller, Post, Req, Res } from '@nestjs/common';
import Stripe from 'stripe';
import express from 'express';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { StripeService } from './stripe.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { BusinessClaimCart } from 'src/entity/business_claim_cart.entity';
import { PaymentService } from '../payment.service';
import { Business } from 'src/entity/business.entity';
import { BusinessDraft } from 'src/entity/business_draft.entity';
import { BusinessService } from 'src/business/business.service';
import { SubscriptionsService } from 'src/subscriptions/subscriptions.service';
import { User } from 'src/entity/user.entity';
import { UsersService } from 'src/services/user.service';

@Controller('stripe')
export class WebhookController {
  constructor(
    private readonly stripe: StripeService,

    @InjectRepository(BusinessClaimCart)
    private readonly cartRepo: Repository<BusinessClaimCart>,

    @InjectRepository(Business)
    private readonly businessRepo: Repository<Business>,

    @InjectRepository(BusinessDraft)
    private readonly draftRepo: Repository<BusinessDraft>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    private readonly paymentService: PaymentService,
    private readonly businessService: BusinessService,
    private readonly subsService: SubscriptionsService,
    private readonly users: UsersService,
    private readonly http: HttpService,
  ) {}

  @Post('webhook')
  async webhook(@Req() req: express.Request, @Res() res: express.Response) {
    const sig = req.headers['stripe-signature'];
    if (!sig || Array.isArray(sig)) {
      return res.status(400).send('Missing signature');
    }

    let event: any;
    try {
      event = this.stripe.constructEvent(req.body as Buffer, sig);
    } catch (err: any) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      // ======================================================
      // ✅ CHECKOUT SUCCESS
      // ======================================================
      if (event.type === 'checkout.session.completed') {
        const session: any = event.data.object;

        // ======================================================
        // A) SUBSCRIPTION + BUSINESS DRAFT FLOW
        // ======================================================
        const draftId = session?.metadata?.draft_id;
        const subId = session?.metadata?.sub_id;

        console.log('[Webhook] type=', event.type);
        console.log('[Webhook] session.id=', session.id);
        console.log(
          '[Webhook] payment_status=',
          session.payment_status,
          'status=',
          session.status,
        );
        console.log('[Webhook] metadata=', session.metadata);
        console.log('[Webhook] subscription=', session.subscription);

        const isPaid =
          session?.payment_status === 'paid' ||
          session?.status === 'complete' ||
          session?.status === 'completed';

        if (draftId && isPaid) {
          const draft = await this.draftRepo.findOne({
            where: { id: draftId },
          });
          if (!draft || draft.status !== 'pending') {
            return res.json({ received: true });
          }

          const p: any = draft.payload || {};

          // 🔐 required fields (as per your rule)
          if (
            !p?.name ||
            !p?.address ||
            !p?.description ||
            !Array.isArray(p?.business_type) ||
            p.business_type.length === 0
          ) {
            await this.draftRepo.update(
              { id: draftId },
              { status: 'failed' as any },
            );
            return res.json({ received: true });
          }

          // ✅ Create business using existing service (best practice)
          // ✅ Create business
          const created = await this.businessService.createBusiness(
            draft.user_id,
            {
              name: p.name,
              business_type: p.business_type,
              description: p.description,
              address: p.address,
              city: p.city,
              state: p.state,
              country: p.country,
              zipcode: p.zipcode,
              place_id: p.place_id,
              latitude: p.latitude,
              longitude: p.longitude,
              logo_url: p.logo_url,
              business_status: 'draft',
              active: false,
              views: 0,
            },
          );

          // ================================
          // ✅ FINAL BUSINESS IMAGE UPLOAD (raw base64 OR data URI)
          // ================================
          const raw = (draft.image_base64 || '').trim();

          if (raw) {
            try {
              // If it's already a data URI, keep it.
              // If it's raw base64, wrap it as a data URI (assume jpeg).
              const dataUri = raw.startsWith('data:image')
                ? raw
                : `data:image/jpeg;base64,${raw}`;

              const resp = await firstValueFrom(
                this.http.post(
                  `${process.env.IMAGES_API_BASE_URL}/images/upload-base64`,
                  {
                    data: dataUri,
                    folder: 'business',
                    fileName: created.id,
                  },
                  {
                    maxBodyLength: Infinity,
                    maxContentLength: Infinity,
                  },
                ),
              );

              const urlRaw =
                resp.data?.url ||
                resp.data?.data?.url ||
                resp.data?.result?.url;

              if (urlRaw) {
                const cleanUrl = urlRaw.replace(/([^:]\/)\/+/g, '$1');

                const upd = await this.businessRepo.update(
                  { id: created.id },
                  { logo_url: cleanUrl },
                );

                console.log(
                  '[Business Upload] updated=',
                  upd.affected,
                  'url=',
                  cleanUrl,
                );
              }
            } catch (e: any) {
              console.error(
                '[Business Image Upload Failed]',
                e?.response?.status,
                e?.response?.data || e?.message || e,
              );
            }
          }

          let startDate: Date | undefined;
          let endDate: Date | undefined;

          const subRef = session.subscription;
          const stripeSubId = typeof subRef === 'string' ? subRef : subRef?.id;

          if (stripeSubId) {
            try {
              const stripeSub: any =
                await this.stripe.retrieveSubscription(stripeSubId);

              startDate = stripeSub?.current_period_start
                ? new Date(stripeSub.current_period_start * 1000)
                : undefined;

              endDate = stripeSub?.current_period_end
                ? new Date(stripeSub.current_period_end * 1000)
                : undefined;
            } catch (e: any) {
              console.error(
                '[Webhook] stripe subscription retrieve failed',
                e?.message || e,
              );
            }
          }

          // ✅ get pending sub row (to know packageName)
          const pendingSub = subId
            ? await this.subsService.findById(subId)
            : null;

          // ✅ business.subscription update (monthly/yearly)
          await this.businessRepo.update(
            { id: created.id },
            { subscription: pendingSub?.packageName ?? undefined },
          );

          // ✅ finalize draft
          await this.draftRepo.update({ id: draftId }, {
            status: 'completed' as any,
            stripe_session_id: session.id,
            stripe_subscription_id: session.subscription || null,
            image_base64: null,
          } as any);

          // ✅ mark subscription PAID + link business + set start/end dates
          if (subId) {
            await this.subsService.markStatusById(subId, 'paid', {
              stripe_subscription_id: session.subscription || null,
              success_at: new Date(),
              business_id: created.id,
              start_date: startDate ?? undefined,
              end_date: endDate ?? undefined,
              payment_reference: session.id,
            } as any);
          }

          console.log('[Webhook] Draft → Business created', {
            draftId,
            businessId: created.id,
          });

          return res.json({ received: true });
        }

        // ======================================================
        // B) BUSINESS CLAIM FLOW (OLD)
        // ======================================================
        if (session.metadata?.purpose === 'business_claim') {
          const { payment_id, batch_id, user_id } = session.metadata;

          if (payment_id) await this.paymentService.markSuccess(payment_id);

          const rows = await this.cartRepo.find({
            where: {
              batch_id,
              user_id,
              status: In(['pending' as any, 'paid' as any]),
            },
          });

          if (!rows.length) return res.json({ received: true });

          // mark cart paid (idempotent)
          await this.cartRepo.update(
            { batch_id, user_id, status: 'pending' as any },
            { status: 'paid' as any },
          );

          const businessIds = [
            ...new Set(rows.map((r) => r.business_id).filter(Boolean)),
          ];

          if (businessIds.length) {
            const upd = await this.businessRepo.update(
              { id: In(businessIds) },
              {
                business_status: 'claimed' as any,
                owner_user_id: user_id,
              } as any,
            );

            console.log(
              '[Webhook] Claim business upd affected=',
              upd.affected,
              businessIds,
            );
          }

          return res.json({ received: true });
        }
      }

      if (event.type === 'account.updated') {
        const account = event.data.object as Stripe.Account;

        const isReady = account.charges_enabled && account.details_submitted;

        if (isReady) {
          // seller_id == account.id stored already in pending step
          const user = await this.userRepo.findOne({
            where: { seller_id: account.id },
          });
          if (user && !user.paid_contributor) {
            await this.users.markPaidContributor(user.id);
          }
        }

        return res.json({ received: true });
      }

      // ======================================================
      // ❌ CHECKOUT EXPIRED / CANCEL
      // ======================================================
      if (event.type === 'checkout.session.expired') {
        const session: any = event.data.object;

        const draftId = session?.metadata?.draft_id;
        const subId = session?.metadata?.sub_id;

        if (draftId) {
          await this.draftRepo.update(
            { id: draftId, status: 'pending' as any },
            { status: 'expired' as any },
          );
        }

        if (subId) {
          await this.subsService.markStatusById(subId, 'canceled', {
            cancel_at: new Date(),
          } as any);
        }
      }

      return res.json({ received: true });
    } catch (e: any) {
      console.error('[Webhook ERROR]', e?.message || e);
      return res.json({ received: true });
    }
  }
}
