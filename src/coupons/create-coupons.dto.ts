import { IsEnum, IsNumber, IsOptional, IsString, IsBoolean } from 'class-validator';

export class CreateCouponsDto {

  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsString()
    @IsOptional()
      validitymonths: string;

  @IsEnum(['percentage', 'fixed'])
  discount_type: 'percentage' | 'fixed';

  @IsNumber()
  discount: number;

  @IsOptional()
  expires_at?: Date;

  @IsOptional()
  @IsNumber()
  usage_limit?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
