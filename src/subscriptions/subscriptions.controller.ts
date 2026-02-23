import { Body, Controller, Get, Post, UseGuards, BadRequestException, Query } from '@nestjs/common';
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

  @Get('my')
  @UseGuards(JwtAuthGuard)
  my(@UserSession() user: any) {
    return this.subs.getMine(user.id);
  }

  @Get('list')
  @UseGuards(JwtAuthGuard)
      listPaginated(
      @Query('page') page = 1, 
      @Query('limit') limit = 10, 
      @Query('search') search?: string, 
      ){
  
  
      return this.subs.listPaginated(Number(page), Number(limit), {
        search,
      });
    }

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  async checkout(@UserSession() user: any, @Body() dto: CreateSubscriptionDto) {
    const clientUrl = (process.env.CLIENT_URL || '').replace(/\/+$/, '');

    if (!dto?.price_id) throw new BadRequestException('price_id is required');
    if (!dto?.package) throw new BadRequestException('package is required');
    if (!dto?.businessDraftPayload) throw new BadRequestException('businessDraftPayload is required');
    if (!user?.email) throw new BadRequestException('User email not found');

    // 1) create pending subscription row (no business_id yet)
    const pending = await this.subs.createPending({
      user_id: user.id,
      business_id: null as any, // ✅ column must be nullable
      price_id: dto.price_id,
      package: dto.package,
    });

    // 2) create stripe session + draft
    const session = await this.stripe.createSubscriptionCheckoutSession({
      userId: user.id,
      customerEmail: user.email,
      priceId: dto.price_id,

      successUrl: `${clientUrl}/subscription/success`,
      cancelUrl: `${clientUrl}/subscription/cancel`,

      metadata: {
        sub_id: pending.id,
        user_id: user.id,
        plan: dto.package,
      },

      businessDraftPayload: dto.businessDraftPayload,
      businessImageBase64: dto.businessImageBase64 || null,
    });

    // 3) store payment_reference = session id
    await this.subs.setPaymentReference(pending.id, session.sessionId);

    return {
      url: session.url,
      sessionId: session.sessionId,
      sub_id: pending.id,
      draft_id: session.draftId,
    };
  }
}
