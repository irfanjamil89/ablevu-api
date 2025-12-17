import { Module } from '@nestjs/common';
import { StripeController } from './stripe/stripe.controller';
import { StripeService } from './stripe/stripe.service';
import { WebhookController } from './stripe/webhook.controller';
import { Payment } from 'src/entity/payment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessClaimCart } from 'src/entity/business_claim_cart.entity';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

@Module({
 imports: [TypeOrmModule.forFeature([Payment, BusinessClaimCart])],
      providers: [StripeService, PaymentService],   
      controllers: [StripeController, WebhookController, PaymentController ],
      exports: [StripeService, PaymentService],
})
export class PaymentModule {}
