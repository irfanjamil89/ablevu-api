import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BusinessQuestions } from "src/entity/business-questions.entity";
import { CreateBusinessQuestionsDto } from "./create-business-questions.dto";
import { UpdateBusinessQuestionsDto } from "./update-business-questions.dto";
import { Repository } from "typeorm";
import { Business } from "src/entity/business.entity";
import { User } from 'src/entity/user.entity';
import { In } from "typeorm";


@Injectable()
export class BusinessQuestionsService {
  constructor(
    @InjectRepository(BusinessQuestions)
    private readonly businessquestionsrepo: Repository<BusinessQuestions>,
    @InjectRepository(Business)
    private readonly businessRepo: Repository<Business>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

  ) { }

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
    filters: { businessId?: string; active?: boolean | undefined, userId: string; userRole: string },
  ) {
    const { businessId, active, userId, userRole } = filters;
    const qb = this.businessquestionsrepo
      .createQueryBuilder('q')
      .take(limit)
      .skip((page - 1) * limit)
      .orderBy('q.created_at', 'DESC');

    if (filters.businessId) {
      qb.andWhere('q.business_id = :businessId', { businessId });
    }
    if (filters.active !== undefined) {
      qb.andWhere('q.active = :active', { active });
    }
    if (userRole === 'User' || userRole === 'Contributor') {
      qb.andWhere('q.created_by = :userId', { userId });
    }
    if (userRole === 'Business') {
      const businesses = await this.businessRepo.find({
        where: { owner: { id: userId } },
        select: ['id'],
      });
      const businessIds = businesses.map((b) => b.id);
      if (!businessIds.length) {
        return {
          data: [],
          meta: {
            total: 0,
            page,
            limit,
            pageCount: 1,
          },
        };
      }

      qb.andWhere('q.business_id IN (:...businessIds)', { businessIds });
    }
    const [items, total] = await qb.getManyAndCount();
    const businessIds = Array.from(new Set(items.map(q => q.business_id)));
    const businesses = await this.businessRepo.find({
      where: { id: In(businessIds) },
      select: ['id', 'name', 'logo_url'],
    });
    const itemsWithNames = await Promise.all(
      items.map(async (q) => {
        let createdByName: string | null = null;

        if (q.show_name) {
          const user = await this.userRepo.findOne({
            where: { id: q.created_by },
            select: ['id', 'first_name', 'last_name'],
          });

          if (user) {
            createdByName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
          }
        }
        const business = businesses.find(b => b.id === q.business_id);


        return {
          ...q,
          created_by_name: createdByName,
          business_name: business?.name ?? null,
          business_logo: business?.logo_url ?? null,
        };
      })
    );
    return {
      data: itemsWithNames,
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