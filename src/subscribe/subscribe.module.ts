import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Subscribe } from "src/entity/subscribe.entity";
import { SubscribeService } from "./subscribe.service";
import { SubscribeController } from "./subscribe.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Subscribe])],
  controllers: [SubscribeController],
  providers: [SubscribeService],
})
export class SubscribeModule {}
