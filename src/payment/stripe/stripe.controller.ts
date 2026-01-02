// stripe.controller.ts
import { Body, Controller, Post, Get, Req } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserSession } from 'src/auth/user.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entity/user.entity';
import { Repository } from 'typeorm';
import { SubscriptionsService } from 'src/subscriptions/subscriptions.service';
import { Business } from 'src/entity/business.entity';
import { In } from 'typeorm';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripe: StripeService,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    private readonly subsService: SubscriptionsService,

    @InjectRepository(Business)
    private readonly businessRepo: Repository<Business>,
  ) {}

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

@UseGuards(JwtAuthGuard)
@Get('billing/me')
async billingMe(@Req() req: any) {
  const userId = req.user?.id;
  if (!userId) {
    return { subscriptions: [], invoices: [], defaultPaymentMethod: null };
  }

  const user = await this.userRepo.findOne({
    where: { id: userId },
    select: { id: true, customer_id: true },
  });

  if (!user?.customer_id) {
    return { subscriptions: [], invoices: [], defaultPaymentMethod: null };
  }

  const [subsList, invoicesList, customer] = await Promise.all([
    this.stripe.listSubscriptions(user.customer_id),
    this.stripe.listInvoices(user.customer_id),
    this.stripe.retrieveCustomer(user.customer_id),
  ]);

  const stripeSubs: any[] = (subsList as any)?.data ?? [];
  const stripeInvoices: any[] = (invoicesList as any)?.data ?? [];

  // ✅ get DB subscriptions for this user (contains business_id + stripe_subscription_id)
  const dbSubs = await this.subsService.findPaidByUser(userId); 
  // return rows with: stripe_subscription_id, business_id

  const subIdToBusinessId = new Map<string, string>();
  for (const row of dbSubs) {
    if (row.stripe_subscription_id && row.business_id) {
      subIdToBusinessId.set(row.stripe_subscription_id, row.business_id);
    }
  }

  // ✅ fetch business names
  const businessIds = [...new Set([...subIdToBusinessId.values()])];
  const businesses = businessIds.length
    ? await this.businessRepo.find({
        where: { id: In(businessIds) },
        select: { id: true, name: true },
      })
    : [];

  const businessMap = new Map(businesses.map(b => [b.id, b.name]));

  // ✅ enrich Stripe subscriptions with businessName
  const subscriptions = stripeSubs.map((s) => {
    const bid = subIdToBusinessId.get(s.id);
    return {
      ...s,
      business_id: bid ?? null,
      businessName: bid ? (businessMap.get(bid) ?? "—") : "—",
    };
  });

  // ✅ enrich invoices with businessName (invoice.subscription -> business_id)
  const invoices = stripeInvoices.map((inv) => {
    const subId =
      typeof inv.subscription === "string" ? inv.subscription : inv.subscription?.id;
    const bid = subId ? subIdToBusinessId.get(subId) : null;

    return {
      ...inv,
      business_id: bid ?? null,
      businessName: bid ? (businessMap.get(bid) ?? "—") : "—",
    };
  });

  // ✅ default payment method (same as earlier)
  let pmId: string | null = null;
  const cpm = (customer as any)?.invoice_settings?.default_payment_method;
  if (typeof cpm === "string") pmId = cpm;
  else if (cpm?.id) pmId = cpm.id;

  if (!pmId && subscriptions.length) {
    const spm = (subscriptions[0] as any)?.default_payment_method;
    if (typeof spm === "string") pmId = spm;
    else if (spm?.id) pmId = spm.id;
  }

  if (!pmId && invoices.length) {
    const pm = (invoices[0] as any)?.payment_intent?.payment_method;
    if (typeof pm === "string") pmId = pm;
    else if (pm?.id) pmId = pm.id;
  }

  const defaultPaymentMethod = pmId
    ? await this.stripe.retrievePaymentMethod(pmId)
    : null;

  return { subscriptions, invoices, defaultPaymentMethod };
}
}