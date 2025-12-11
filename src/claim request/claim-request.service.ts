import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClaimRequest } from 'src/entity/claim_request.entity';
import { CreateClaimRequestDto } from './create-claim-request.dto';
import { UpdateClaimRequestDto } from './update-claim-request.dto';
import { User } from 'src/entity/user.entity';
import { Business } from 'src/entity/business.entity';

@Injectable()
export class ClaimRequestService {
  constructor(
    @InjectRepository(ClaimRequest)
    private readonly claimRepo: Repository<ClaimRequest>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Business)
    private readonly businessRepo: Repository<Business>,
  ) {}

  async create(currentUserId: string, dto: CreateClaimRequestDto) {
    const business = await this.businessRepo.findOne({
      where: { id: dto.business_id },
    });

    if (!business) {
      throw new NotFoundException('Invalid business_id: business not found');
    }

    const user = await this.userRepo.findOne({
      where: { id: dto.user_id },
    });

    if (!user) {
      throw new NotFoundException('Invalid user_id: user not found');
    }

    const entity = this.claimRepo.create({
      ...dto,
      created_by: currentUserId,
      updated_by: currentUserId,
    });

    return this.claimRepo.save(entity);
  }

  async update(id: string, currentUserId: string, dto: UpdateClaimRequestDto) {
    const record = await this.findOne(id);

    Object.assign(record, dto, { updated_by: currentUserId });

    return this.claimRepo.save(record);
  }

  async delete(id: string, userId: string) {
  const claim = await this.claimRepo.findOne({
    where: { id },
  });

  if (!claim) {
    throw new NotFoundException('Claim request not found');
  }
  return this.claimRepo.remove(claim);
}


  async findAll() {
    return this.claimRepo.find({
      order: { created_at: 'DESC' },
    });
  }
  
  async findOne(id: string) {
    const record = await this.claimRepo.findOne({ where: { id } });

    if (!record) {
      throw new NotFoundException('Claim request not found');
    }

    return record;
  }
  
}
