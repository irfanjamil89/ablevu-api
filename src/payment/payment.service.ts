import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Payment } from "src/entity/payment.entity";

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly repo: Repository<Payment>,
  ) {}

  createPending(input: { user_id: string; batch_id: string; amount: number }) {
    const row = this.repo.create({
      user_id: input.user_id,
      batch_id: input.batch_id,
      amount: input.amount,
      status: "pending",
      payment_date: new Date(),
    });
    return this.repo.save(row);
  }

  async markSuccess(id: string) {
    const r = await this.repo.update(
      { id },
      { status: "success", success_at: new Date() },
    );
    if (!r.affected) throw new NotFoundException("Payment not found");
    return { message: "Payment success", id };
  }

  async markCancelled(id: string) {
    const r = await this.repo.update(
      { id },
      { status: "cancelled", cancel_at: new Date() },
    );
    if (!r.affected) throw new NotFoundException("Payment not found");
    return { message: "Payment cancelled", id };
  }

  myPayments(user_id: string) {
    return this.repo.find({ where: { user_id }, order: { created_at: "DESC" as any } });
  }

  byBatch(batch_id: string) {
    return this.repo.find({ where: { batch_id }, order: { created_at: "DESC" as any } });
  }
}
