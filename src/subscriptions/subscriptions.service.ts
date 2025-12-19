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

    private readonly stripe: StripeService,
    
  ) {}

  async createPending(input: {
    user_id: string;
    business_id: string;
    price_id: string;
    package: string;
    amount?: number;
  }) {
    const amount = await this.stripe.getPriceAmount(input.price_id);
    const sub = this.subRepo.create({
      user_id: input.user_id,
      business_id: input.business_id,
      priceId: input.price_id,
      packageName: input.package,
      amount: amount,
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

  async markStatusById(id: string, status: SubscriptionStatus, extra?: Partial<Subscription>) {
    const sub = await this.findById(id);
    Object.assign(sub, { status }, extra || {});
    return this.subRepo.save(sub);
  }

  async markPaidBySessionId(sessionId: string, extra?: Partial<Subscription>) {
    const sub = await this.subRepo.findOne({ where: { payment_reference: sessionId } });
    if (!sub) throw new NotFoundException('Subscription not found for this session');
    sub.status = 'paid';
    sub.success_at = new Date();
    Object.assign(sub, extra || {});
    return this.subRepo.save(sub);
  }

  async setPaymentReference(id: string, ref: string) {
    return this.subRepo.update({ id }, { payment_reference: ref });
  }

  async markCanceledByStripeSubscriptionId(stripeSubId: string) {
    const sub = await this.subRepo.findOne({ where: { payment_reference: stripeSubId } });
    if (!sub) return null;
    sub.status = 'canceled';
    sub.cancel_at = new Date();
    return this.subRepo.save(sub);
  }
}
