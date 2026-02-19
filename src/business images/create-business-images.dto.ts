import { IsString, IsNotEmpty, IsOptional, IsBoolean } from "class-validator";

export class CreateBusinessImages{

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
        @IsNotEmpty()
        image_url: string;

        @IsString()
        @IsNotEmpty()
        business_id: string;
    
        @IsOptional()
        @IsBoolean()
        active: boolean;

        @IsString()
        @IsOptional()
        external_id: string;    
}