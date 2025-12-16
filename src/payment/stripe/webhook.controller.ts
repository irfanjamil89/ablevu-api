// stripe.webhook.controller.ts
import { Controller, Post, Req, Res } from '@nestjs/common';
import express from 'express';
import { StripeService } from './stripe.service';

@Controller('stripe')
export class WebhookController {
  constructor(private readonly stripe: StripeService) {}

  @Post('webhook')
  async webhook(@Req() req: express.Request, @Res() res: express.Response) {
    const sig = req.headers['stripe-signature'];
    if (!sig || Array.isArray(sig)) return res.status(400).send('Missing signature');

    let event;
    try {
      event = this.stripe.constructEvent(req.body as Buffer, sig);
    } catch (err: any) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // ✅ Minimal set for one-time Checkout
    if (event.type === 'checkout.session.completed') {
      const session: any = event.data.object;

      // For one-time payment Checkout, confirm it is actually paid:
      if (session.payment_status === 'paid') {
        const orderId = session.metadata?.orderId;
        const userId = session.metadata?.userId;
        const paymentIntentId = session.payment_intent;

        // TODO: update Mongo:
        // - mark orderId as PAID
        // - store paymentIntentId + session.id
      }
    }

    return res.json({ received: true });
  }
}
