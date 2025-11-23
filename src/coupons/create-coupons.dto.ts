import { IsNotEmpty, IsString, IsBoolean, IsOptional } from "class-validator";

export class CreateCouponsDto{

    @IsString()
    @IsNotEmpty()
    code: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    validitymonths: string;

    @IsString()
    @IsNotEmpty()
    discount: string;

    @IsBoolean()
    @IsOptional()
    active: boolean;

    
}