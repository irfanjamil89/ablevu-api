// stripe.service.ts
import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  async createCheckoutSession(input: {
    orderId: string;
    userId: string;
    items: Array<{ name: string; unitAmount: number; quantity: number }>; // unitAmount in cents
  }) {
    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: input.items.map((i) => ({
        price_data: {
          currency: 'usd',
          product_data: { name: i.name },
          unit_amount: i.unitAmount,
        },
        quantity: i.quantity,
      })),
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
      metadata: { orderId: input.orderId, userId: input.userId },
    });
 console.log('Checkout url:', session.url);
 console.log('Checkout id:', session.id);
    return { url: session.url, id: session.id };
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
    priceId: string;          // price_...
    successUrl: string;
    cancelUrl: string;
  }) {
    // 1) Create customer (or lookup & reuse in your DB)
    const customer = await this.stripe.customers.create({
      email: input.customerEmail,
      metadata: { userId: input.userId },
    });

    // 2) Create Checkout session in subscription mode
    const session = await this.stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customer.id,
      line_items: [{ price: input.priceId, quantity: 1 }],

      // Optional: let users enter promo codes
      allow_promotion_codes: true,

      success_url: input.successUrl + "?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: input.cancelUrl,

      metadata: { userId: input.userId },
    });

    return {
      url: session.url,
      sessionId: session.id,
      customerId: customer.id,
    };
  }

}
