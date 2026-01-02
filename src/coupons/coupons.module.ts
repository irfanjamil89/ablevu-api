import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Coupons } from 'src/entity/coupons.entity'
import { CouponsController } from './coupons.controller'
import { CouponsService } from './coupons.service'
import { PaymentModule } from 'src/payment/payment.module'

@Module({
    imports: [TypeOrmModule.forFeature([Coupons]),
    PaymentModule,
],
    controllers: [CouponsController],
    providers: [CouponsService] ,
    exports: [CouponsService]
})

export class CouponsModule {}