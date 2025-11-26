import { IsNotEmpty, IsString, IsBoolean, IsOptional } from "class-validator";

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

    @IsString()
    @IsOptional()
    discount: string;

    @IsBoolean()
    @IsOptional()
    active: boolean;

    
}