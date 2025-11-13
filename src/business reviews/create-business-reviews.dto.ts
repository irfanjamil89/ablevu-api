import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateBusinessReviewsDto{

    @IsString()
    @IsNotEmpty()
    business_id: string;

    @IsString()
    @IsNotEmpty()
    review_type_id: string;

    @IsString()
    @IsNotEmpty()
    description:string;

    @IsBoolean()
    @IsOptional()
    approved: boolean;

    @IsBoolean()
    @IsOptional()
    active: boolean;

}