import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BusinessSave } from "src/entity/business_save.entity";
import { CreateBusinessSaveDto } from "./create-business-save.dto";
import { UpdateBusinessSaveDto } from "./update-business-save.dto";
import { Repository } from "typeorm";
import { Business } from "src/entity/business.entity";
import { User } from 'src/entity/user.entity';

@Injectable()
export class BusinessSaveService{
    constructor(
    @InjectRepository(BusinessSave)
    private readonly businessSaveRepo: Repository<BusinessSave>,
    @InjectRepository(Business)
    private readonly businessRepo: Repository<Business>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    ){}

    async createBusinessSave(userId: string, dto: CreateBusinessSaveDto) {
         if (!dto.business_id) {
          throw new BadRequestException('business_id is required');
        }
        const business = await this.businessRepo.findOne({
          where: { id: dto.business_id },
        });
        if (!business) {
          throw new NotFoundException('Business not found');
        }

        const save = this.businessSaveRepo.create({
          business_id: dto.business_id,
          user_id: userId,
          note: dto.note,
          created_by: userId,
          updated_by: userId,
        });
    
        return this.businessSaveRepo.save(save);
      }

    async updateBusinessSave(id: string, userId: string, dto: UpdateBusinessSaveDto) {
        const save = await this.businessSaveRepo.findOne({ where: { id } });
         if (!save) throw new NotFoundException('Business Save not found');
        
        Object.assign(save, {
            note: dto.note ?? save.note,
            updated_by: userId,
          });
      
        return this.businessSaveRepo.save(save);
        }

    async deleteBusinessSave(id: string, userId: string) {
        const save = await this.businessSaveRepo.findOne({ where: { id } });
         if (!save) throw new NotFoundException('Business Save not found');

        save.updated_by = userId;
        return this.businessSaveRepo.remove(save);
        }

    async listPaginatedByUser(
        userId: string,
        page = 1,
        limit = 10,
        ) {
        const qb = this.businessSaveRepo
            .createQueryBuilder('s')
            .where('s.user_id = :userId', { userId })
            .orderBy('s.created_at', 'DESC')
            .take(limit)
            .skip((page - 1) * limit);

        const [data, total] = await qb.getManyAndCount();

        return {
            data,
            meta: {
            total,
            page,
            limit,
            pageCount: Math.ceil(total / limit) || 1,
            },
        };
        }



  async getBusinessSaveProfile(id: string) {
    const save = await this.businessSaveRepo.findOne({ where: { id } });
    if (!save) throw new NotFoundException('Business Save not found');
    return save;
  }

}