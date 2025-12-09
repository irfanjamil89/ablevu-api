import { Controller, Post, Body, Delete, Param } from "@nestjs/common";
import { SubscribeService } from "./subscribe.service";
import { CreateSubscribeDto } from "./create-subscribe.dto";

@Controller("subscribe")
export class SubscribeController {
  constructor(private readonly service: SubscribeService) {}

  @Post("create")
  create(@Body() dto: CreateSubscribeDto) {
    return this.service.create(dto);
  }

  @Delete(":id")
  delete(@Param("id") id: string) {
    return this.service.delete(id);
  }
}
