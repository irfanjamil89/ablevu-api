import { IsOptional, IsString, IsNumberString, IsUUID } from "class-validator";

export class UpdateBusinessClaimCartDto {
  @IsUUID()
  @IsOptional()
  business_id?: string;

  @IsUUID()
  @IsOptional()
  user_id?: string;

  @IsString()
  @IsOptional()
  batch_id?: string;

  @IsNumberString()
  @IsOptional()
  amount?: string;

  @IsString()
  @IsOptional()
  status?: string;
}
