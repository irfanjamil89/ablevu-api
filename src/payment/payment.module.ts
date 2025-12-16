import { Module } from '@nestjs/common';
import { StripeController } from './stripe/stripe.controller';
import { StripeService } from './stripe/stripe.service';
import { WebhookController } from './stripe/webhook.controller';

@Module({
 // imports: [TypeOrmModule.forFeature([Partner, BusinessPartners])],
      providers: [StripeService],   
      controllers: [StripeController, WebhookController ],
      exports: [StripeService],
})
export class PaymentModule {}
