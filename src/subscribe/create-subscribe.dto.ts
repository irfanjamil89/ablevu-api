import { IsEmail, IsNotEmpty, IsOptional, IsBoolean } from "class-validator";

export class CreateSubscribeDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
