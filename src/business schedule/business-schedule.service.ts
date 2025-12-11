import { Injectable, NotFoundException, ForbiddenException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessSchedule } from 'src/entity/business_schedule.entity';
import { Business } from 'src/entity/business.entity';
import { CreateScheduleDto } from './create-business-schedule.dto';
import { UpdateScheduleDto } from './update-business-schedule.dto';

type ListScheduleFilters = {
  businessId?: string;
  day?: string;
  active?: boolean;
};

@Injectable()
export class BusinessScheduleService {
  constructor(
    @InjectRepository(BusinessSchedule)
    private readonly scheduleRepo: Repository<BusinessSchedule>,
    @InjectRepository(Business)
    private readonly businessRepo: Repository<Business>,
  ) {}

async createBusinessSchedule(
  user: { id: string; user_role: string },
  dto: CreateScheduleDto,
) {
  const business = await this.businessRepo.findOne({
    where: { id: dto.businessId },
  });

  if (!business) {
    throw new NotFoundException('Business not found');
  }

  const scheduleEntities = dto.schedules.map((items) =>
    this.scheduleRepo.create({
      business,
      day: items.day,
      opening_time: items.opening_time ?? null,
      closing_time: items.closing_time ?? null,
      opening_time_text: items.opening_time_text ?? null,
      closing_time_text: items.closing_time_text ?? null,
      active: items.active ?? true,
      created_by: user.id,
      modified_by: user.id,
    }),
  );

  return this.scheduleRepo.save(scheduleEntities);
}

async updateBusinessSchedule(id: string, userId: string, dto: UpdateScheduleDto) {
  const schedule = await this.scheduleRepo.findOne({
    where: { id },
  });

  if (!schedule) {
    throw new NotFoundException('Business Schedule not found');
  }

  schedule.day = dto.day ? dto.day : schedule.day;

  schedule.opening_time = dto.opening_time
    ? new Date(dto.opening_time)
    : schedule.opening_time;

  schedule.closing_time = dto.closing_time
    ? new Date(dto.closing_time)
    : schedule.closing_time;

  schedule.opening_time_text =
    dto.opening_time_text ?? schedule.opening_time_text;

  schedule.closing_time_text =
    dto.closing_time_text ?? schedule.closing_time_text;

  schedule.active = dto.active ?? schedule.active;

  schedule.modified_by = userId;

  return this.scheduleRepo.save(schedule);
}
async deleteBusinessSchedule(userId: string, id: string) {
  const schedule = await this.scheduleRepo.findOne({
    where: { id },
    relations: { business: true }, // owner: true hata diya
  });

  if (!schedule) {
    throw new NotFoundException('Business Schedule not found');
  }
  await this.scheduleRepo.remove(schedule);
  return { deleted: true };
}

  async listPaginated(
    page = 1,
    limit = 10,
    filters: ListScheduleFilters,
  ) {
    const qb = this.scheduleRepo
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.business', 'b');

    if (filters.businessId) {
      qb.andWhere('b.id = :businessId', { businessId: filters.businessId });
    }

    if (filters.day) {
      qb.andWhere('LOWER(s.day) = LOWER(:day)', { day: filters.day });
    }

    if (filters.active !== undefined) {
      qb.andWhere('s.active = :active', { active: filters.active });
    }

    qb
      .orderBy('s.day', 'ASC')
      .take(limit)
      .skip((page - 1) * limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      data: items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getBusinessScheduleProfile(id: string) {
    const schedule = await this.scheduleRepo.findOne({
      where: { id },
      relations: { business: true },
    });
    if (!schedule) {
      throw new NotFoundException('Business Schedule not found');
    }
    return schedule;
  }
}
