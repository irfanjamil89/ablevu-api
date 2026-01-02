import { Module,forwardRef } from '@nestjs/common';
import { StripeController } from './stripe/stripe.controller';
import { StripeService } from './stripe/stripe.service';
import { WebhookController } from './stripe/webhook.controller';
import { Payment } from 'src/entity/payment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessClaimCart } from 'src/entity/business_claim_cart.entity';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { Business } from 'src/entity/business.entity';
import { Subscription } from 'src/entity/subscription.entity';
import { UserModule } from 'src/user/user.module';
import { User } from 'src/entity/user.entity';
import { BusinessDraft } from 'src/entity/business_draft.entity';
import { BusinessModule } from 'src/business/business.module';
import { SubscriptionsModule } from 'src/subscriptions/subscriptions.module';
import { HttpModule } from '@nestjs/axios';

@Module({
 imports: [TypeOrmModule.forFeature([Payment, BusinessClaimCart,Business, Subscription,User, BusinessDraft, User]), UserModule,BusinessModule,forwardRef(() => SubscriptionsModule),HttpModule],
      providers: [StripeService, PaymentService],   
      controllers: [StripeController, WebhookController, PaymentController ],
      exports: [StripeService, PaymentService],
})
export class PaymentModule {}
