import { IsString, IsNotEmpty, IsBoolean } from 'class-validator';

export class CreateFeedbackTypeDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    image_url: string;

    @IsBoolean()    
    active: boolean;
}
