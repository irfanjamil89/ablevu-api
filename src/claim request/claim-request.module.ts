import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClaimRequest } from 'src/entity/claim_request.entity';
import { ClaimRequestService } from './claim-request.service';
import { ClaimRequestController } from './claim-request.controller';
import { Business } from 'src/entity/business.entity';
import { User } from 'src/entity/user.entity';
@Module({
  imports: [TypeOrmModule.forFeature([ClaimRequest, User, Business])],
  controllers: [ClaimRequestController],
  providers: [ClaimRequestService],
})
export class ClaimRequestModule {}
