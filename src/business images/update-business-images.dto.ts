import { IsString, IsNotEmpty, IsOptional, IsBoolean } from "class-validator";

export class UpdateBusinessImages{

        @IsString()
        @IsOptional()
        name: string;

        @IsString()
        @IsOptional()
        description: string;

        @IsString()
        @IsOptional()
        tags: string;

        @IsString()
        @IsOptional()
        image_url: string;

        @IsString()
        @IsOptional()
        business_id: string;
    
        @IsOptional()
        @IsBoolean()
        active: boolean;
    
}