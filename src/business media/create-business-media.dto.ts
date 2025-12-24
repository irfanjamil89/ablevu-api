import { IsString, IsNotEmpty, IsOptional, IsBoolean } from "class-validator";

export class CreateBusinessMedia{

        @IsString()
        @IsNotEmpty()
        business_id: string;
    
        @IsNotEmpty()
        @IsString()
        label: string;
    
        @IsNotEmpty()
        @IsString()
        link: string;

        @IsString()
        description:string;

        @IsOptional()
        @IsBoolean()
        active: boolean;
    
}