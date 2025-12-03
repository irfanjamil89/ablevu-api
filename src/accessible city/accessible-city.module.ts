import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/entity/user.entity";
import { AccessibleCityController } from "src/accessible city/accessible-city.controller";
import { AccessibleCityService } from "src/accessible city/accessible-city.service";
import { AccessibleCity } from "src/entity/accessible_city.entity"
import { Business } from "src/entity/business.entity";


@Module({
    imports: [TypeOrmModule.forFeature([AccessibleCity, User, Business])],
    providers: [AccessibleCityService],
    controllers: [AccessibleCityController],
    exports: [AccessibleCityService],
})
export class AccessibleCityModule {}