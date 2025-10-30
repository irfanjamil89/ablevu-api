import { ArrayMinSize, IsArray, IsEmail, IsOptional, IsString, IsUrl, Matches, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

class SocialLinksDto {
    @IsString()
    platform: 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'youtube';

    @IsUrl()
    url: string;
}
export class CreateBusinessDto {
    @IsString()
    name: string;

    @IsArray()
    @ArrayMinSize(1)
    @IsString({ each: true })
    categories: string[];

    @IsOptional()
    @IsUrl()
    website?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @Matches(/^\+?[1-9]\d{1,14}$/)
    phoneNumber?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => SocialLinksDto)
    socialLinks?: SocialLinksDto[];

    @IsOptional()
    @IsString()
    about?: string;
}