// stripe.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessClaimCart } from 'src/entity/business_claim_cart.entity';
import { PaymentService } from '../payment.service';
import { Business } from 'src/entity/business.entity';

@Injectable()
export class StripeService {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  constructor(
    @InjectRepository(BusinessClaimCart)
    private readonly cartRepo: Repository<BusinessClaimCart>,

    @InjectRepository(Business)
    private readonly businessRepo: Repository<Business>,

    private readonly paymentService: PaymentService,
  ) {}

  async createCheckoutSessionFromBatch(input: { userId: string; batchId: string }) {
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
    throw new BadRequestException('No pending cart items found for this batch');
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

  // ✅ Debug log
  console.log('[StripeCheckout] user:', input.userId, 'batch:', input.batchId, 'rows:', rows.length, 'total:', total);

  // 4) create stripe session (if this fails => nothing else runs)
  let session: Stripe.Checkout.Session;
  try {
    session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
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
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
      metadata: {
        batch_id: input.batchId,
        user_id: input.userId,
        payment_id: savedPayment.id,
      },
    });
  } catch (err: any) {
    console.error('[StripeCheckout] Stripe session create failed:', err?.message || err);
    throw new BadRequestException(err?.message || 'Stripe session create failed');
  }

  // 5) mark cart items processed
  const upd = await this.cartRepo.update(
    { user_id: input.userId, batch_id: input.batchId, status: 'pending' as any },
    { status: 'processed' as any },
  );

  console.log('[StripeCheckout] cart update affected:', upd.affected);

  // ✅ if 0, then status mismatch or rows already not pending
  if (!upd.affected) {
    throw new BadRequestException(
      'Cart items were not updated to processed. (Maybe status is not "pending" in DB?)'
    );
  }

  // 6) claim businesses (DON'T block checkout if this fails)
  try {
    const businessIds = rows.map(r => r.business_id).filter(Boolean);
    console.log('[StripeCheckout] claiming businesses:', businessIds);

    await this.businessRepo
      .createQueryBuilder()
      .update(Business)
      .set({
        business_status: 'claimed' as any,
        owner: { id: input.userId } as any, // sets owner_user_id
        modified_at: new Date() as any,
      })
      .where('id IN (:...ids)', { ids: businessIds })
      .execute();

  } catch (e: any) {
    console.error('[StripeCheckout] business claim update failed:', e?.message || e);
    // ✅ don't throw, cart already processed and user should still go to stripe
  }

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
      type: "express",
      email,
      metadata: { userId },
      // country: "US", // set if you know it (recommended)
    });

    return account; // contains account.id (acct_...)
  }

  async createOnboardingLink(accountId: string) {
  const link = await this.stripe.accountLinks.create({
    account: accountId,
    type: "account_onboarding",
    refresh_url: `${process.env.CLIENT_URL}/seller/onboarding/refresh`,
    return_url: `${process.env.CLIENT_URL}/seller/onboarding/return`,
  });

  return link.url;
}

 async createSubscriptionCheckoutSession(input: {
  userId: string;
  customerEmail: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}) {
  const customer = await this.stripe.customers.create({
    email: input.customerEmail,
    metadata: { userId: input.userId },
  });

  const session = await this.stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customer.id,
    line_items: [{ price: input.priceId, quantity: 1 }],
    allow_promotion_codes: true,
    success_url: `${process.env.CLIENT_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: input.cancelUrl,
    metadata: {
      userId: input.userId,
      ...(input.metadata || {}),
    },
  });

  return {
    url: session.url,
    sessionId: session.id,
    customerId: customer.id, 
  };
}
async getPriceAmount(priceId: string): Promise<string> {
  const price = await this.stripe.prices.retrieve(priceId);

  if (!price.unit_amount) {
    throw new Error('Invalid price amount');
  }

  // Stripe cents → dollars
  return (price.unit_amount / 100).toFixed(2);
}

}
