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
import { Coupons } from 'src/entity/coupons.entity';

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

    @InjectRepository(Coupons)
    private readonly couponsRepo: Repository<Coupons>,

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

          if (isPaid) {
  await this.tryIncrementCouponUsedCountFromSession(session);
}

        if (draftId && isPaid) {
          const draft = await this.draftRepo.findOne({
            where: { id: draftId },
          });
          if (!draft || draft.status !== 'pending') {
            return res.json({ received: true });
          }
          const stripeCustomerId =
            typeof session.customer === 'string'
              ? session.customer
              : session.customer?.id;

          if (stripeCustomerId) {
            const u = await this.userRepo.findOne({
              where: { id: draft.user_id },
              select: { id: true, customer_id: true },
            });

            if (!u?.customer_id) {
              await this.userRepo.update(
                { id: draft.user_id },
                { customer_id: stripeCustomerId },
              );
            }
            console.log('[Webhook] Saved customer_id:', {
              userId: draft.user_id,
              customer_id: stripeCustomerId,
            });
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
              business_status: 'claimed',
              active: true,
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

          let stripeSub: any = null;

          if (stripeSubId) {
            try {
              stripeSub = await this.stripe.retrieveSubscription(stripeSubId);

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

          // ✅ get pending sub row (to know packageName, priceId, amount)
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
            stripe_subscription_id: stripeSubId || null,
            image_base64: null,
          } as any);

          // after pendingSub is loaded, before markStatusById(...)
          const pkg = (pendingSub?.packageName || '').toLowerCase();

          // If Stripe didn't provide period dates, fallback based on plan
          if (!startDate || !endDate) {
            const now = new Date();
            startDate = startDate ?? now;

            if (pkg === 'monthly') {
              const d = new Date(startDate);
              d.setMonth(d.getMonth() + 1);
              endDate = endDate ?? d;
            } else if (pkg === 'yearly') {
              const d = new Date(startDate);
              d.setFullYear(d.getFullYear() + 1);
              endDate = endDate ?? d;
            } else {
              const d = new Date(startDate);
              d.setDate(d.getDate() + 30);
              endDate = endDate ?? d;
            }
          }

          // ✅ invoice_id
          const invoiceId =
            (typeof stripeSub?.latest_invoice === 'string'
              ? stripeSub.latest_invoice
              : stripeSub?.latest_invoice?.id) ||
            (typeof session?.invoice === 'string'
              ? session.invoice
              : session?.invoice?.id) ||
            null;

          // ✅ mark subscription PAID + link business + set start/end dates + entity columns
          if (subId) {
            await this.subsService.markStatusById(subId, 'paid', {
              stripe_subscription_id: stripeSubId || null,
              invoice_id: invoiceId,
              success_at: new Date(),
              business_id: created.id,
              start_date: startDate ?? undefined,
              end_date: endDate ?? undefined,
              payment_reference: session.id,

              // ✅ entity columns (best from pendingSub)
              amount: pendingSub?.amount ?? '0.00',
              packageName: pendingSub?.packageName ?? pkg,
              priceId: pendingSub?.priceId ?? '',
              discount_code: pendingSub?.discount_code ?? null,
              discount_amount: pendingSub?.discount_amount ?? '0.00',
            } as any);
          }
          return res.json({ received: true });
        }

        // ======================================================
// B) BUSINESS CLAIM FLOW (VALIDATED)
// ======================================================
if (session.metadata?.purpose === 'business_claim') {
  const { payment_id, batch_id, user_id } = session.metadata || {};

  if (!payment_id || !batch_id || !user_id) return res.json({ received: true });
  if (session.payment_status !== 'paid') return res.json({ received: true });

  const payment = await this.paymentService.findById(payment_id);
  if (!payment) return res.json({ received: true });
  if ((payment.status || '').toLowerCase() === 'paid') return res.json({ received: true });

  const rows = await this.cartRepo.find({
    where: { batch_id, user_id, status: 'pending' as any },
  });
  if (!rows.length) return res.json({ received: true });

  // ✅ Stripe subscription retrieve
  const stripeSubRef = session.subscription;
  const stripeSubId = typeof stripeSubRef === 'string' ? stripeSubRef : stripeSubRef?.id;

  let stripeSub: any = null;
  let stripeStartDate: Date | null = null;
  let stripeEndDate: Date | null = null;

  if (stripeSubId) {
    try {
      stripeSub = await this.stripe.retrieveSubscription(stripeSubId);
      stripeStartDate = stripeSub?.current_period_start
        ? new Date(stripeSub.current_period_start * 1000)
        : null;
      stripeEndDate = stripeSub?.current_period_end
        ? new Date(stripeSub.current_period_end * 1000)
        : null;
    } catch (e: any) {
      console.error('[Webhook] claim sub retrieve failed:', e?.message);
    }
  }

  const invoiceId =
    (typeof stripeSub?.latest_invoice === 'string'
      ? stripeSub.latest_invoice
      : stripeSub?.latest_invoice?.id) || null;

  // ✅ pending_sub_ids parse
  let pendingSubIds: Record<string, string> = {};
  try {
    pendingSubIds = JSON.parse(session.metadata?.pending_sub_ids || '{}');
  } catch {}

  // ✅ Mark payment success
  await this.paymentService.markSuccess(payment_id);

  // ✅ Mark cart paid
  await this.cartRepo.update(
    { batch_id, user_id, status: 'pending' as any },
    { status: 'paid' as any }
  );

  // ✅ Per-business: claim + subscription
  const now = new Date();

  for (const row of rows) {
    if (!row.business_id) continue;

    const amount = Number(row.amount);
    const planType: 'monthly' | 'yearly' = amount === 299 ? 'yearly' : 'monthly';

    // Fallback dates agar Stripe ne nahi diya
    const startDate = stripeStartDate ?? now;
    const endDate = stripeEndDate ?? (() => {
      const d = new Date(startDate);
      planType === 'yearly'
        ? d.setFullYear(d.getFullYear() + 1)
        : d.setMonth(d.getMonth() + 1);
      return d;
    })();

    // ✅ Business claimed
    await this.businessRepo.update(
      { id: row.business_id },
      {
        business_status: 'claimed' as any,
        owner_user_id: user_id,
        subscription: planType,
        active: true,
      } as any
    );

    // ✅ DB subscription paid mark
    const dbSubId = pendingSubIds[row.business_id];
    if (dbSubId) {
      try {
        await this.subsService.markStatusById(dbSubId, 'paid', {
          stripe_subscription_id: stripeSubId || null,
          invoice_id: invoiceId,
          success_at: now,
          start_date: startDate,
          end_date: endDate,
          payment_reference: session.id,
          amount: String(amount),
          packageName: planType,
          discount_amount: '0.00',
        } as any);
      } catch (e: any) {
        console.error('[Webhook] sub mark paid failed:', row.business_id, e?.message);
      }
    }

    console.log('[Webhook] claimed:', {
      business_id: row.business_id,
      planType,
      stripeSubId,
      startDate,
      endDate,
    });
  }

  // ✅ Stripe metadata update (once, after loop)
  if (stripeSubId) {
    try {
      await (this.stripe as any).stripe.subscriptions.update(stripeSubId, {
        metadata: {
          user_id,
          batch_id,
          business_ids: rows.map(r => r.business_id).filter(Boolean).join(','),
        },
      });
    } catch (e: any) {
      console.error('[Webhook] Stripe metadata update failed:', e?.message);
    }
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
  private async tryIncrementCouponUsedCountFromSession(session: any) {
  try {
    const stripeSubId =
      typeof session.subscription === 'string'
        ? session.subscription
        : session.subscription?.id;

    if (!stripeSubId) return;

    const stripeSub = await this.stripe.retrieveSubscription(stripeSubId);

    const invoiceId =
      typeof stripeSub?.latest_invoice === 'string'
        ? stripeSub.latest_invoice
        : stripeSub?.latest_invoice?.id;

    if (!invoiceId) return;

    const invoice: any = await this.stripe.retrieveInvoiceWithPromo(invoiceId);

    // discounts can be: string | Discount | DeletedDiscount
    const firstDiscount = invoice?.discounts?.[0];
    if (!firstDiscount) return;

    // promotion_code can be: string | PromotionCode | null
    let promoId: string | null = null;
    let promoCode: string | null = null;

    if (typeof firstDiscount !== 'string') {
      const pc = (firstDiscount as any).promotion_code;

      if (pc) {
        if (typeof pc === 'string') {
          promoId = pc;
        } else {
          promoId = pc.id ?? null;
          promoCode = pc.code ?? null;
        }
      }
    }

    if (!promoId) return;

    await this.couponsRepo.increment(
      { stripe_promo_code_id: promoId },
      'used_count',
      1,
    );

    // ✅ Optional: auto-disable if usage_limit reached
    const c = await this.couponsRepo.findOne({
      where: { stripe_promo_code_id: promoId },
    });

    if (c?.usage_limit && c.used_count >= c.usage_limit) {
      await this.couponsRepo.update({ id: c.id }, { active: false });
    }

    console.log('[Webhook] used_count++', { promoId, code: promoCode });
  } catch (e: any) {
    console.error('[Webhook] coupon increment failed:', e?.message || e);
  }
}




}
