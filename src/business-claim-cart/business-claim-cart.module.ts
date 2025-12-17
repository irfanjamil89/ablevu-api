import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BusinessClaimCart } from "src/entity/business_claim_cart.entity";
import { BusinessClaimCartController } from "./business-claim-cart.controller";
import { BusinessClaimCartService } from "./business-claim-cart.service";

@Module({
  imports: [TypeOrmModule.forFeature([BusinessClaimCart])],
  controllers: [BusinessClaimCartController],
  providers: [BusinessClaimCartService],
  exports: [BusinessClaimCartService],
})
export class BusinessClaimCartModule {}
