import { IsString, IsNumber, IsNotEmpty, IsBoolean } from 'class-validator';

export class UpdateBusinessTypeDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNumber()
    display_order: number;

    @IsString()
    picture_url: string;

    @IsBoolean()    
    active: boolean;

}