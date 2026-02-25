import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Coupons } from "src/entity/coupons.entity";
import { Repository } from "typeorm";
import { CreateCouponsDto } from "./create-coupons.dto";
import { UpdateCouponsDto } from "./update-coupons.dto";
import { StripeService } from "src/payment/stripe/stripe.service";

@Injectable()
export class CouponsService{
    constructor(
        @InjectRepository(Coupons)
        private readonly couponsRepo: Repository <Coupons>,

        private readonly stripeService: StripeService,
    ){}

 async createCoupons(userid: string, dto: CreateCouponsDto) {
  const discountType = dto.discount_type ?? 'percentage';

  // ✅ expires_at ko us din ki aakhri second set karo
  let expiresAt: Date | null = null;
  if (dto.expires_at) {
    expiresAt = new Date(dto.expires_at);
    expiresAt.setHours(23, 59, 59, 999); // ✅ 24 Feb → 24 Feb 23:59:59
  }

  const stripeInput: any = {
    code: dto.code.trim(),
    name: dto.name.trim(),
    active: dto.active ?? true,
    discount_type: discountType,
    validitymonths: dto.validitymonths ? Number(dto.validitymonths) : undefined,
    expires_at: expiresAt, // ✅ 23:59:59 wali date Stripe ko bheji
    usage_limit: dto.usage_limit ? Number(dto.usage_limit) : undefined,
  };

  if (discountType === 'percentage') {
    stripeInput.percent = Number(dto.discount);
  } else {
    stripeInput.amount_off = Number(dto.discount);
  }

  const stripe = await this.stripeService.createStripeCouponAndPromo(stripeInput);

  const coupon = this.couponsRepo.create({
    code: dto.code.trim(),
    name: dto.name.trim(),
    discount_type: discountType,
    discount: Number(dto.discount),
    expires_at: expiresAt, // ✅ Same 23:59:59 DB mein bhi save hoga
    usage_limit: dto.usage_limit ? Number(dto.usage_limit) : null,
    active: dto.active ?? true,
    created_by: userid,
    modified_by: userid,
    stripe_coupon_id: stripe.stripe_coupon_id,
    stripe_promo_code_id: stripe.stripe_promo_code_id,
  } as any);

  return this.couponsRepo.save(coupon);
}




    async updateCoupons (id: string, userid: string, dto: UpdateCouponsDto){
        const coupon = await this.couponsRepo.findOne({
            where: {id},
        });
        if (!coupon){
            throw new NotFoundException('Coupon Not Found')
        }
        coupon.code = dto.code !== undefined? dto.code: coupon.code;
        coupon.name = dto.name !== undefined? dto.name: coupon.name;
        coupon.discount_type = dto.discount_type !== undefined? dto.discount_type: coupon.discount_type;
        coupon.discount = dto.discount !== undefined? dto.discount: coupon.discount;
        coupon.expires_at = dto.expires_at !== undefined? dto.expires_at: coupon.expires_at;
        coupon.usage_limit = dto.usage_limit !== undefined? dto.usage_limit: coupon.usage_limit;
        coupon.active = dto.active !== undefined? dto.active: coupon.active;
        coupon.modified_by = userid;

        return this.couponsRepo.save(coupon);
    }

    async deleteCoupons(id: string, userid: string) {
  const coupon = await this.couponsRepo.findOne({ where: { id } });
  if (!coupon) throw new NotFoundException("Coupon Not Found");

  // ✅ First Stripe cleanup
  await this.stripeService.deleteCouponAndPromo(
    coupon.stripe_coupon_id,
    coupon.stripe_promo_code_id
  );

  coupon.modified_by = userid;
  return await this.couponsRepo.remove(coupon);
}


    async getCouponsProfile(id: string) {
  const coupon = await this.couponsRepo.findOne({ where: { id } });
  if (!coupon) throw new NotFoundException('Coupon Not Found');

  if (coupon.expires_at && new Date(coupon.expires_at) < new Date() && coupon.active === true) {
    coupon.active = false;
    await this.couponsRepo.save(coupon);
  }

  return coupon;
}

async listPaginated(page = 1, limit = 10, filters: { active?: boolean }) {
  const qb = this.couponsRepo.createQueryBuilder('c');

  if (filters.active !== undefined) {
    qb.andWhere('c.active = :active', { active: filters.active });
  }

  qb.take(limit).skip((page - 1) * limit);
  const [items, total] = await qb.getManyAndCount();

  for (const coupon of items) {
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date() && coupon.active === true) {
      coupon.active = false;
      await this.couponsRepo.save(coupon);
    }
  }

  return {
    data: items,
    total,
    page,
    limit,
    totalPage: Math.ceil(total / limit),
  };
}
}