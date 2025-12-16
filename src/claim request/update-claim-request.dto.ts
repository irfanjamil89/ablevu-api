import { IsOptional, IsString, IsBoolean, IsNumber } from 'class-validator';

export class UpdateClaimRequestDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsBoolean()
  is_paid?: boolean;
}
