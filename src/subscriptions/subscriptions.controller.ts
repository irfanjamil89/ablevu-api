import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserSession } from 'src/auth/user.decorator';
import { CreateSubscriptionDto } from './create-subscription.dto';
import { SubscriptionsService } from './subscriptions.service';
import { StripeService } from 'src/payment/stripe/stripe.service';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(
    private readonly subs: SubscriptionsService,
    private readonly stripe: StripeService,
  ) {}

  // ✅ list my subscriptions
  @Get('my')
  @UseGuards(JwtAuthGuard)
  my(@UserSession() user: any) {
    return this.subs.getMine(user.id);
  }

  /**
   * ✅ Create pending subscription row + Stripe subscription checkout session
   */
  @Post('checkout')
@UseGuards(JwtAuthGuard)
async checkout(@UserSession() user: any, @Body() dto: CreateSubscriptionDto) {
  // 1) create pending in DB
  const pending = await this.subs.createPending({
    user_id: user.id,
    business_id: dto.business_id,
    price_id: dto.price_id,
    package: dto.package,
  });

  // ✅ Make sure CLIENT_URL is like: https://frontend.com (no trailing slash)
  const clientUrl = process.env.CLIENT_URL;

  // 2) create stripe session (mode subscription)
  const session = await this.stripe.createSubscriptionCheckoutSession({
    userId: user.id,
    customerEmail: user.email,
    priceId: dto.price_id,

    // ✅ IMPORTANT: include session_id placeholder so success page can verify
    successUrl: `${clientUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${clientUrl}/subscription/cancel`,

    // ✅ metadata (keep keys consistent with webhook)
    metadata: {
      sub_id: pending.id,                 // 👈 rename (recommended)
      business_id: dto.business_id,
      user_id: user.id,
      plan: dto.package,
    },
  });

  // 3) store payment_reference = session.id (ok)
  await this.subs.setPaymentReference(pending.id, session.sessionId);

  return {
    url: session.url,
    sessionId: session.sessionId,
    sub_id: pending.id,
  };
}

}
