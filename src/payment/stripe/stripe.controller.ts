// stripe.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserSession } from 'src/auth/user.decorator';
import { use } from 'passport';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripe: StripeService) {}

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  async checkout(@UserSession() user: any, @Body() body: { batch_id: string }) {
    return this.stripe.createCheckoutSessionFromBatch({
      userId: user.id,
      batchId: body.batch_id,
    });
  }

   @Post("create-account")
  async createAccount(@Body() body: { userId: string; email?: string }) {
    console.log('Created Stripe Account:'+body.email);
    const acct = await this.stripe.createConnectedAccount(body.userId, body.email);
    // TODO: save acct.id to Mongo against userId
console.log('Created Stripe Account:', acct.id);
     const url = await this.stripe.createOnboardingLink(acct.id );
    return { url };
  }

  @Post("subscription/checkout")
  create(@Body() body: { userId: string; customerEmail: string; priceId: string }) {
    return this.stripe.createSubscriptionCheckoutSession({
      userId: body.userId,
      customerEmail: body.customerEmail,
      priceId: body.priceId,
      successUrl: `${process.env.CLIENT_URL}/checkout/success`,
      cancelUrl: `${process.env.CLIENT_URL}/checkout/cancel`,
    });
  }

   
}
