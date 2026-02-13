import { IsNotEmpty, IsString, IsBoolean, IsOptional, IsNumber, IsEnum } from "class-validator";

export class UpdateCouponsDto{

    @IsString()
    @IsOptional()
    code: string;

    @IsString()
    @IsOptional()
    name: string;

    @IsString()
    @IsOptional()
    validitymonths: string;

    @IsEnum(['percentage', 'fixed'])
      discount_type: 'percentage' | 'fixed';

    @IsString()
    @IsOptional()
    discount: number;

    @IsOptional()
      expires_at?: Date;
    
      @IsOptional()
      @IsNumber()
      usage_limit?: number;

    @IsBoolean()
    @IsOptional()
    active: boolean;

    
}