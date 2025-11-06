import { Module } from "@nestjs/common";
import { BusinessService } from "./business.service";
import { BusinessController } from "./business.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Business } from "src/entity/business.entity";
import { User } from "src/entity/user.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Business, User])],
    providers: [BusinessService],
    controllers: [BusinessController],
    exports: [BusinessService],
})
export class BusinessModule {}