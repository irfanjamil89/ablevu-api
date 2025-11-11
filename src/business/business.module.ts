import { Module } from "@nestjs/common";
import { BusinessService } from "./business.service";
import { BusinessController } from "./business.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Business } from "src/entity/business.entity";
import { User } from "src/entity/user.entity";
import { BusinessLinkedType } from "src/entity/business_linked_type.entity";
import { BusinessAccessibleFeature } from "src/entity/business_accessiblity_feature.entuty";

@Module({
    imports: [TypeOrmModule.forFeature([Business, User, BusinessLinkedType, BusinessAccessibleFeature])],
    providers: [BusinessService],
    controllers: [BusinessController],
    exports: [BusinessService],
})
export class BusinessModule {}