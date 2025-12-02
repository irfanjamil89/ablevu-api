import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class UpdateFeedbackTypeDto {
    @IsString()
    @IsOptional()
    name: string;

    @IsString()
    @IsOptional()
    image_url: string;

    @IsBoolean() 
    @IsOptional()   
    active: boolean;
}
