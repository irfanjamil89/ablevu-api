import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from 'src/entity/subscription.entity';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { PaymentModule } from 'src/payment/payment.module';

import { Business } from 'src/entity/business.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Subscription, Business]), forwardRef(() => PaymentModule),],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
