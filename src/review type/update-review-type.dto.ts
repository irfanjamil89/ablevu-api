import { IsBoolean, IsOptional, IsString, IsUrl } from "class-validator";

export class UpdateReviewTypeDto{

    @IsOptional()
    @IsString()
    title: string;

    @IsUrl()
    @IsOptional()
    image_url: string;

    @IsBoolean()
    @IsOptional()
    active: boolean;

}