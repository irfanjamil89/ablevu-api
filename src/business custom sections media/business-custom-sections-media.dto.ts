import { IsString, IsNotEmpty, IsOptional, IsBoolean } from "class-validator";

export class BusinessCustomSectionsMediaDto{

        @IsString()
        @IsNotEmpty()
        business_id: string;

        @IsString()
        @IsNotEmpty()
        business_custom_section_id: string;

        @IsString()
        @IsNotEmpty()
        label: string;

        @IsString()
        link: string;

        @IsOptional()
        @IsBoolean()
        active: boolean;
}

