import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription, SubscriptionStatus } from 'src/entity/subscription.entity';
import { StripeService } from 'src/payment/stripe/stripe.service';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subRepo: Repository<Subscription>,
    
  ) {}

  async createPending(input: {
  user_id: string;
  business_id?: string | null;
  price_id: string;
  package: string;
  amount?: number;
}) {
  const sub = this.subRepo.create({
    user_id: input.user_id,
    business_id: input.business_id ?? null,
    priceId: input.price_id,
    packageName: (input.package || '').toLowerCase().trim(),
    amount: Number(input.amount ?? 0).toFixed(2),
    status: 'pending',
  });

  return this.subRepo.save(sub);
}



  async getMine(user_id: string) {
    return this.subRepo.find({
      where: { user_id },
      order: { created_at: 'DESC' as any },
    });
  }

  async findById(id: string) {
    const sub = await this.subRepo.findOne({ where: { id } });
    if (!sub) throw new NotFoundException('Subscription not found');
    return sub;
  }

  async markStatusById(
  id: string,
  status: SubscriptionStatus,
  extra?: Partial<Subscription>,
) {
  const sub = await this.findById(id);

  // ✅ idempotency: same status dobara set na ho
  if (sub.status === status) {
    return sub;
  }

  sub.status = status;

  // ✅ timestamps automatically set
  if (status === 'paid' && !sub.success_at) {
    sub.success_at = new Date();
  }

  if ((status === 'canceled') && !sub.cancel_at) {
    sub.cancel_at = new Date();
  }

  // ✅ allow controlled extra updates (stripe ids etc)
  if (extra) {
    Object.assign(sub, extra);
  }

  return this.subRepo.save(sub);
}

  async markPaidBySessionId(sessionId: string, extra?: Partial<Subscription>) {
  const sub = await this.subRepo.findOne({ where: { payment_reference: sessionId } });
  if (!sub) throw new NotFoundException('Subscription not found for this session');

  if (sub.status === 'paid') return sub; // ✅ idempotent

  sub.status = 'paid';
  sub.success_at = new Date();
  Object.assign(sub, extra || {});
  return this.subRepo.save(sub);
}

  async setPaymentReference(id: string, ref: string) {
    return this.subRepo.update({ id }, { payment_reference: ref });
  }

  async markCanceledByStripeSubscriptionId(stripeSubId: string) {
  const sub = await this.subRepo.findOne({
    where: { stripe_subscription_id: stripeSubId },
  });
  if (!sub) return null;

  sub.status = 'canceled';
  sub.cancel_at = new Date();
  return this.subRepo.save(sub);
}

// should return rows for the logged-in user (paid/current)
findPaidByUser(userId: string) {
  return this.subRepo.find({
    where: { user_id: userId, status: 'paid' as any },
    select: { stripe_subscription_id: true, business_id: true },
  });
}


}
