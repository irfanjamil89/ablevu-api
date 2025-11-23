import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BusinessQuestions } from "src/entity/business-questions.entity";
import { CreateBusinessQuestionsDto } from "./create-business-questions.dto";
import { UpdateBusinessQuestionsDto } from "./update-business-questions.dto";
import { Repository } from "typeorm";
import { Business } from "src/entity/business.entity";

@Injectable()
export class BusinessQuestionsService{
    constructor(
    @InjectRepository(BusinessQuestions)
    private readonly businessquestionsrepo: Repository<BusinessQuestions>,
    @InjectRepository(Business)
    private readonly businessRepo: Repository<Business>

    ){}

    async createBusinessQuestions(userId: string, dto: CreateBusinessQuestionsDto) {
         if (!dto.business_id) {
          throw new BadRequestException('business_id is required');
        }
        const business = await this.businessRepo.findOne({
          where: { id: dto.business_id },
        });
        if (!business) {
          throw new NotFoundException('Business not found');
        }
        
        const questions = this.businessquestionsrepo.create({
          business_id: dto.business_id,
          answer: dto.answer,
          question: dto.question,
          show_name: dto.show_name,
          active: dto.active,
          created_by: userId,
          modified_by: userId,
        });
    
        return this.businessquestionsrepo.save(questions);
      }

    async updateBusinessQuestions(id: string, userId: string, dto: UpdateBusinessQuestionsDto) {
        const question = await this.businessquestionsrepo.findOne({ where: { id } });
         if (!question) throw new NotFoundException('Business Question not found');
      
         if (dto.business_id) {
        const business = await this.businessRepo.findOne({ where: { id: dto.business_id } });
         if (!business) throw new NotFoundException('Business not found');
          }
        
        Object.assign(question, {
            businessId: dto.business_id ?? question.business_id,
            answer: dto.answer ?? question.answer,
            question: dto.question ?? question.question,
            show_name: dto.show_name ?? question.show_name, 
            active: dto.active ?? question.active,
            modifiedBy: userId,
          });
      
        return this.businessquestionsrepo.save(question);
        }

    async deleteBusinessQuestions(id: string, userId: string) {
        const question = await this.businessquestionsrepo.findOne({ where: { id } });
         if (!question) throw new NotFoundException('Business Question not found');

        question.modified_by = userId;
        return this.businessquestionsrepo.remove(question);
        }

    async listpaginated(
    page = 1,
    limit = 10,
    filters: { businessId?: string; active?: boolean | undefined },
  ) {
    const qb = this.businessquestionsrepo
      .createQueryBuilder('q')
      .take(limit)
      .skip((page - 1) * limit)
      .orderBy('q.created_at', 'DESC');

    if (filters.businessId) {
      qb.andWhere('r.business_id = :businessId', { businessId: filters.businessId });
    }
     if (filters.active !== undefined) {
    qb.andWhere('q.active = :active', { active: filters.active });
    }
    const [items, total] = await qb.getManyAndCount();
    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        pageCount: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getBusinessQuestionsProfile(id: string) {
    const question = await this.businessquestionsrepo.findOne({ where: { id } });
    if (!question) throw new NotFoundException('Business Question not found');
    return question;
  }

}