// stripe.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessClaimCart } from 'src/entity/business_claim_cart.entity';
import { PaymentService } from '../payment.service';

@Injectable()
export class StripeService {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  constructor(
    @InjectRepository(BusinessClaimCart)
    private readonly cartRepo: Repository<BusinessClaimCart>,

    private readonly paymentService: PaymentService,
  ) {}

  async createCheckoutSessionFromBatch(input: { userId: string; batchId: string }) {
    if (!input.batchId) throw new BadRequestException('batch_id is required');

    // 1) cart rows (pending) fetch
    const rows = await this.cartRepo.find({
      where: { user_id: input.userId, batch_id: input.batchId, status: 'pending' as any },
      order: { created_at: 'DESC' as any },
    });

    if (!rows.length) {
      throw new BadRequestException('No pending cart items found for this batch');
    }

    // 2) total calculate (server-side)
    const total = rows.reduce((sum, r) => sum + Number(r.amount || 0), 0);
    if (total <= 0) throw new BadRequestException('Invalid total amount');

    // 3) create payment row (pending)
    const savedPayment = await this.paymentService.createPending({
      user_id: input.userId,
      batch_id: input.batchId,
      amount: total,
    });

    // 4) Stripe amount must be in cents
    const amountInCents = Math.round(total * 100);

    const session = await this.stripe.checkout.sessions.create({
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

}
