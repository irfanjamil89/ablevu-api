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
}
