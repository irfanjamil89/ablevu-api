import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { UserSession } from "src/auth/user.decorator";
import { PaymentService } from "./payment.service";

@Controller("payments")
export class PaymentController {
  constructor(private readonly service: PaymentService) {}

  @Get("my")
  @UseGuards(JwtAuthGuard)
  my(@UserSession() user: any) {
    return this.service.myPayments(user.id);
  }

  @Get("batch/:batch_id")
  @UseGuards(JwtAuthGuard)
  byBatch(@Param("batch_id") batch_id: string) {
    return this.service.byBatch(batch_id);
  }
}
