import { IsNotEmpty, IsString, IsUUID, IsNumberString, IsOptional } from "class-validator";

export class CreateBusinessClaimCartDto {
  @IsUUID()
  @IsNotEmpty()
  business_id: string;

  @IsString()
  @IsNotEmpty()
  batch_id: string;

  @IsNumberString()
  @IsNotEmpty()
  amount: string;

  @IsString()
  @IsOptional()
  status?: string; 
}
