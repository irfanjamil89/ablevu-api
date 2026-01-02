// stripe.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserSession } from 'src/auth/user.decorator';


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
  @UseGuards(JwtAuthGuard)
  async createAccount(@UserSession() user: any) {
    const result = await this.stripe.startPaidContributorOnboarding({
      userId: user.id,
      email: user.email,
    });

    return { url: result.url };
  }

  @Post("subscription/checkout")
create(@Body() body: {
  userId: string;
  customerEmail: string;
  priceId: string;
  business_draft: any;
  business_image_base64?: string;
}) {
  return this.stripe.createSubscriptionCheckoutSession({
    userId: body.userId,
    customerEmail: body.customerEmail,
    priceId: body.priceId,
    successUrl: `${process.env.CLIENT_URL}/subscription/success`,
    cancelUrl: `${process.env.CLIENT_URL}/subscription/cancel`,
    metadata: {},

    businessDraftPayload: body.business_draft,
    businessImageBase64: body.business_image_base64 || null,
  });
}


   
}
