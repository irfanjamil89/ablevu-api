import { IsBoolean, IsOptional, IsString } from "class-validator";

export class UpdateBusinessReviewsDto{

    @IsString()
    @IsOptional()
    business_id: string;

    @IsString()
    @IsOptional()
    review_type_id: string;

    @IsString()
    @IsOptional()
    description:string;

    @IsBoolean()
    @IsOptional()
    approved: boolean;

    @IsBoolean()
    @IsOptional()
    active: boolean;

}