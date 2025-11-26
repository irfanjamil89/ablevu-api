import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUrl } from "class-validator";

export class CreateReviewTypeDto{

    @IsNotEmpty()
    @IsString()
    title: string;

    @IsUrl()
    @IsOptional()
    image_url: string;

    @IsBoolean()
    @IsOptional()
    active: boolean;

}