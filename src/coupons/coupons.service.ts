import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Coupons } from "src/entity/coupons.entity";
import { Repository } from "typeorm";
import { CreateCouponsDto } from "./create-coupons.dto";
import { UpdateCouponsDto } from "./update-coupons.dto";

@Injectable()
export class CouponsService{
    constructor(
        @InjectRepository(Coupons)
        private readonly couponsRepo: Repository <Coupons>,
    ){}

    async createCoupons( userid: string, dto: CreateCouponsDto){
        const coupon = this.couponsRepo.create({
            code: dto.code,
            name: dto.name,
            validitymonths: dto.validitymonths,
            discount: dto.discount,
            active: dto.active ?? true,
            created_by: userid,
            modified_by: userid,
        })
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
        coupon.validitymonths = dto.validitymonths !== undefined? dto.validitymonths: coupon.validitymonths;
        coupon.discount = dto.discount !== undefined? dto.discount: coupon.discount;
        coupon.active = dto.active !== undefined? dto.active: coupon.active;
        coupon.modified_by = userid;

        return this.couponsRepo.save(coupon);
    }

    async deleteCoupons (id: string, userid: string){
        const coupon = await this.couponsRepo.findOne({
            where: {id},
        });
        if(!coupon){
            throw new NotFoundException('Coupon Not Found')
        }
        coupon.modified_by=userid;
        return await this.couponsRepo.remove(coupon);
    }

    async listPaginated (
        page = 1,
        limit = 10,
        filters:{ active?: boolean | undefined}
    ){
        const qb = this.couponsRepo.createQueryBuilder('c');

        if(filters.active !== undefined){
            qb.andWhere('c.active = :active', {active: filters.active})
        }

        qb
        .take(limit)
        .skip((page - 1) * limit);

        const [items, total] =await qb.getManyAndCount();

        return{
            data: items,
            total,
            page,
            limit,
            totalPage: Math.ceil(total / limit),
        };
    }

    async getCouponsProfile(id: string){
        const coupon = await this.couponsRepo.findOne({
            where: {id},
        });
        if(!coupon){
            throw new NotFoundException('Coupon Not Found');
        }
        return coupon;
    }

}