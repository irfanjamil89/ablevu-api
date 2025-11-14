import { IsString, IsOptional, IsBoolean } from "class-validator";

export class UpdateBusinessMedia{

        @IsString()
        @IsOptional()
        business_id: string;
    
        @IsOptional()
        @IsString()
        label: string;
    
        @IsOptional()
        @IsString()
        link: string;

        @IsOptional()
        @IsBoolean()
        active: boolean;
    
}