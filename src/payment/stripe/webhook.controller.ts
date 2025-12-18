import { Controller, Post, Req, Res } from '@nestjs/common';
import express from 'express';
import { StripeService } from './stripe.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessClaimCart } from 'src/entity/business_claim_cart.entity';
import { PaymentService } from '../payment.service';

@Controller('stripe')
export class WebhookController {
  constructor(
    private readonly stripe: StripeService,

    @InjectRepository(BusinessClaimCart)
    private readonly cartRepo: Repository<BusinessClaimCart>,

    private readonly paymentService: PaymentService,
  ) {}

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

    // ✅ Payment Success
    if (event.type === 'checkout.session.completed') {
      const session: any = event.data.object;

      if (session.payment_status === 'paid') {
        const paymentId = session.metadata?.payment_id;
        const batchId = session.metadata?.batch_id;

        if (paymentId) {
          await this.paymentService.markSuccess(paymentId);
        }

        if (batchId) {
          await this.cartRepo.update(
            { batch_id: batchId, status: 'pending' as any },
            { status: 'paid' as any, modified_at: new Date() as any },
          );
        }
      }
    }

    // ✅ Cancel/Expired
    if (event.type === 'checkout.session.expired') {
      const session: any = event.data.object;
      const paymentId = session.metadata?.payment_id;
      if (paymentId) await this.paymentService.markCancelled(paymentId);
    }

    return res.json({ received: true });
  }
}
