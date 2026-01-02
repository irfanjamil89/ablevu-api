import { BadRequestException, Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessClaimCart } from 'src/entity/business_claim_cart.entity';
import { PaymentService } from '../payment.service';
import { Business } from 'src/entity/business.entity';
import { UsersService } from 'src/services/user.service';
import { User } from 'src/entity/user.entity';
import { BusinessDraft } from 'src/entity/business_draft.entity';
import { SubscriptionsService } from 'src/subscriptions/subscriptions.service'; // ✅ ADD

@Injectable()
export class StripeService {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  constructor(
    @InjectRepository(BusinessClaimCart)
    private readonly cartRepo: Repository<BusinessClaimCart>,

    @InjectRepository(Business)
    private readonly businessRepo: Repository<Business>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(BusinessDraft)
    private readonly businessDraftRepo: Repository<BusinessDraft>,

    private readonly users: UsersService,
    private readonly paymentService: PaymentService,

    private readonly subsService: SubscriptionsService,
    private readonly http: HttpService,
  ) {}

  async createCheckoutSessionFromBatch(input: {
    userId: string;
    batchId: string;
  }) {
    if (!input.batchId) throw new BadRequestException('batch_id is required');

    // 1) cart rows (pending) fetch
    const rows = await this.cartRepo.find({
      where: {
        user_id: input.userId,
        batch_id: input.batchId,
        status: 'pending' as any,
      },
      order: { created_at: 'DESC' as any },
    });

    if (!rows.length) {
      throw new BadRequestException(
        'No pending cart items found for this batch',
      );
    }

    // 2) total calculate
    const total = rows.reduce((sum, r) => sum + Number(r.amount || 0), 0);
    if (total <= 0) throw new BadRequestException('Invalid total amount');

    // 3) create payment row (pending)
    const savedPayment = await this.paymentService.createPending({
      user_id: input.userId,
      batch_id: input.batchId,
      amount: total,
    });

    const amountInCents = Math.round(total * 100);

    const user = await this.userRepo.findOne({
      where: { id: input.userId },
      select: { email: true },
    });

    if (!user?.email) {
      throw new BadRequestException('User email not found');
    }

    console.log(
      '[StripeCheckout] user:',
      input.userId,
      'batch:',
      input.batchId,
      'rows:',
      rows.length,
      'total:',
      total,
    );

    // ✅ Use existing customer_id if present, otherwise create + save
const fullUser = await this.userRepo.findOne({
  where: { id: input.userId },
  select: { id: true, email: true, customer_id: true },
});

if (!fullUser?.email) throw new BadRequestException('User email not found');

let customerId = fullUser.customer_id;

if (!customerId) {
  const customer = await this.stripe.customers.create({
    email: fullUser.email,
    metadata: { userId: input.userId },
    address: { country: 'US' },
  });

  customerId = customer.id;

  await this.userRepo.update(
    { id: input.userId },
    { customer_id: customerId },
  );
}


    // ✅ 4) create stripe session ONLY (NO cart update, NO business claim here)
    let session: Stripe.Checkout.Session;
    try {
      session = await this.stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        customer: customerId, 
        billing_address_collection: 'required',
        customer_update: { address: 'auto' },
        locale: 'en',
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: { name: `Business Claim (Batch ${input.batchId})` },
              unit_amount: amountInCents,
            },
            quantity: 1,
          },
        ],
        success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL}/business-claim/cancel`,

        metadata: {
          purpose: 'business_claim',
          batch_id: input.batchId,
          user_id: input.userId,
          payment_id: savedPayment.id,
        },
      });
    } catch (err: any) {
      console.error(
        '[StripeCheckout] Stripe session create failed:',
        err?.message || err,
      );
      throw new BadRequestException(
        err?.message || 'Stripe session create failed',
      );
    }

    // ✅ Return only stripe url (claim will happen in webhook)
    return { url: session.url, id: session.id, payment_id: savedPayment.id };
  }

  constructEvent(rawBody: Buffer, signature: string) {
    return this.stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  }

  async createConnectedAccount(userId: string, email?: string) {
    const account = await this.stripe.accounts.create({
      type: 'express',
      country: 'US',
      email,
      metadata: { userId },
    });

    return account;
  }

  async createOnboardingLink(accountId: string) {
    const link = await this.stripe.accountLinks.create({
      account: accountId,
      type: 'account_onboarding',
      refresh_url: `${process.env.CLIENT_URL}/contributor/onboarding/refresh?account=${accountId}`,
      return_url: `${process.env.CLIENT_URL}/contributor/onboarding/return?account=${accountId}`,
    });

    return link.url;
  }

  async startPaidContributorOnboarding(input: { userId: string; email?: string }) {
  const acct = await this.createConnectedAccount(input.userId, input.email);

  await this.users.setContributorOnboardingPending(input.userId, acct.id);

  const url = await this.createOnboardingLink(acct.id);
  return { url, accountId: acct.id };
}


  // ==========================================================
  // ✅ SUBSCRIPTION CHECKOUT + DRAFT + PENDING SUB ROW
  // ==========================================================
  async createSubscriptionCheckoutSession(input: {
    userId: string;
    customerEmail: string;
    priceId: string;
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;

    businessDraftPayload: any;
    businessImageBase64?: string | null;

    // ✅ (optional) plan name to store in DB ("monthly" | "yearly" etc)
    packageName?: string;
  }) {
    if (!input.userId) throw new BadRequestException('userId is required');
    if (!input.customerEmail)
      throw new BadRequestException('customerEmail is required');
    if (!input.priceId) throw new BadRequestException('priceId is required');

    // ✅ validate payload
    const p = input.businessDraftPayload || {};
    const address = (p.address || p.fullAddress || '').trim();
    const businessType = Array.isArray(p.business_type) ? p.business_type : [];

    if (!p?.name?.trim())
      throw new BadRequestException('Draft: name is required');
    if (!address) throw new BadRequestException('Draft: address is required');
    if (!p?.description?.trim())
      throw new BadRequestException('Draft: description is required');
    if (!businessType.length)
      throw new BadRequestException('Draft: business_type is required');

    // 1) create customer
    // ✅ Use existing customer_id if present, otherwise create + save
const fullUser = await this.userRepo.findOne({
  where: { id: input.userId },
  select: { id: true, email: true, customer_id: true },
});

let customerId = fullUser?.customer_id;

if (!customerId) {
  const customer = await this.stripe.customers.create({
    email: input.customerEmail, // or fullUser?.email || input.customerEmail
    address: { country: 'US' },
    metadata: { userId: input.userId },
  });

  customerId = customer.id;

  await this.userRepo.update(
    { id: input.userId },
    { customer_id: customerId },
  );
}


    // 2) save draft
    const draft = await this.businessDraftRepo.save(
      this.businessDraftRepo.create({
        user_id: input.userId,
        status: 'pending',
        payload: {
          ...p,
          address, // ✅ normalize
          business_type: businessType,
        },
        image_base64: input.businessImageBase64 || null,
      }),
    );

    const plan = (input.packageName || '').toLowerCase().trim();
    const normalizedPackage: 'monthly' | 'yearly' = plan.includes('year')
      ? 'yearly'
      : 'monthly';
    // 3) create pending subscription row in DB (IMPORTANT)
    //    amount stored for your records; webhook will mark paid using sub_id
    const amountStr = await this.getPriceAmount(input.priceId); // "12.34"
    const pendingSub = await this.subsService.createPending({
      user_id: input.userId,
      business_id: null,
      price_id: input.priceId,
      package: normalizedPackage,
      amount: Number(amountStr),
    });

    try {
      // ✅ safe URL building
      const success = new URL(input.successUrl);
      success.searchParams.set('draft_id', draft.id);
      success.searchParams.set('session_id', '{CHECKOUT_SESSION_ID}');

      const cancel = new URL(input.cancelUrl);
      cancel.searchParams.set('draft_id', draft.id);

      const session = await this.stripe.checkout.sessions.create({
        mode: 'subscription',
        customer: customerId,
        billing_address_collection: 'required', // ✅ show address + country
        customer_update: { address: 'auto' },
        locale: 'en', // ✅ US-style English UI
        client_reference_id: input.userId,
        line_items: [{ price: input.priceId, quantity: 1 }],
        allow_promotion_codes: true,

        success_url: success.toString(),
        cancel_url: cancel.toString(),

        metadata: {
          user_id: input.userId,
          draft_id: draft.id,
          sub_id: pendingSub.id, // ✅ THIS FIXES YOUR WEBHOOK STATUS UPDATE
          ...(input.metadata || {}),
        },
      });

      // keep traceability
      await this.businessDraftRepo.update({ id: draft.id }, {
        stripe_session_id: session.id,
      } as any);

      return {
        url: session.url,
        sessionId: session.id,
        customerId: customerId,
        draftId: draft.id,
        subId: pendingSub.id,
      };
    } catch (err: any) {
      // mark draft failed
      await this.businessDraftRepo.update({ id: draft.id }, {
        status: 'failed' as any,
        modified_at: new Date() as any,
      } as any);

      // optional: mark sub failed (so you can track)
      try {
        await this.subsService.markStatusById(pendingSub.id, 'failed', {
          payment_reference: 'stripe_session_create_failed',
        } as any);
      } catch {}

      throw new BadRequestException(
        err?.message || 'Stripe session create failed',
      );
    }
  }

  async getPriceAmount(priceId: string): Promise<string> {
    const price = await this.stripe.prices.retrieve(priceId);

    if (!price.unit_amount) {
      throw new Error('Invalid price amount');
    }

    // Stripe cents → dollars
    return (price.unit_amount / 100).toFixed(2);
  }

  async retrieveSubscription(subId: string): Promise<Stripe.Subscription> {
    return (await this.stripe.subscriptions.retrieve(
      subId,
    )) as Stripe.Subscription;
  }
  async listSubscriptions(customerId: string) {
  return this.stripe.subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 20,
    expand: [
      "data.default_payment_method",   
      "data.items.data.price"          
    ],
  });
}


async listInvoices(customerId: string) {
  return this.stripe.invoices.list({
    customer: customerId,
    limit: 20,
    expand: ["data.payment_intent.payment_method"],
  });
}


async getCustomerWithDefaultPaymentMethod(customerId: string) {
  const customer = await this.stripe.customers.retrieve(customerId, {
    expand: ['invoice_settings.default_payment_method'],
  });
  return customer;
}
async retrieveCustomer(customerId: string) {
  return this.stripe.customers.retrieve(customerId);
}

async retrievePaymentMethod(pmId: string) {
  return this.stripe.paymentMethods.retrieve(pmId);
}

async createStripePercentCouponAndPromo(input: {
  code: string;
  name: string;
  percent: number;
  validitymonths?: number;
  active: boolean;
}) {
  const percent = Number(input.percent);
  if (!Number.isFinite(percent) || percent <= 0 || percent > 100) {
    throw new Error("Invalid percent discount. Must be 1-100.");
  }

  // 1) Coupon
  const coupon = await this.stripe.coupons.create({
    name: input.name,
    percent_off: percent,
    duration: input.validitymonths && input.validitymonths > 0 ? "repeating" : "once",
    duration_in_months:
      input.validitymonths && input.validitymonths > 0 ? input.validitymonths : undefined,
    metadata: { source: "db_coupon", code: input.code },
  });

  // 2) Promotion Code (NEW API SHAPE)
  const promo = await this.stripe.promotionCodes.create({
    promotion: {
      type: "coupon",
      coupon: coupon.id,
    },
    code: input.code,
    active: input.active,
    metadata: { source: "db_coupon" },
  });

  return { stripe_coupon_id: coupon.id, stripe_promo_code_id: promo.id };
}



}
