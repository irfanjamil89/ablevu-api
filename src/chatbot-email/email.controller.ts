import { Controller, Get, Body, Post } from '@nestjs/common';
import { EmailService } from './email.service';
import { CreateEmailDto } from './email.dto';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  
  @Post('create-email')
    async createEmail(@Body() dto: CreateEmailDto) {
      return this.emailService.sendEmail(dto.to, dto.subject, dto.body);
    }
}
