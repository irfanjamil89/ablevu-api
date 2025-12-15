// stripe.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { StripeService } from './stripe.service';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripe: StripeService) {}

  @Post('checkout')
  async checkout(@Body() body: any) {
    // IMPORTANT: in production, DO NOT trust unitAmount from client
    // Look up items/prices from DB instead.
    console.log('Checkout body:', body);
    return this.stripe.createCheckoutSession({
      orderId: body.orderId,
      userId: body.userId,
      items: body.items,
    });
  }
}
