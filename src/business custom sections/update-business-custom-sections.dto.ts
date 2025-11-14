import { IsString, IsNotEmpty, IsOptional, IsBoolean } from "class-validator";

export class UpdateBusinessCustomSectionsDto{


        @IsString()
        @IsNotEmpty()
        business_id: string;
    
        @IsNotEmpty()
        @IsString()
        label: string;
    
        @IsOptional()
        @IsBoolean()
        active: boolean;
    
}