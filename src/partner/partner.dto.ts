import { IsBoolean, IsNotEmpty, IsString, IsUrl, IsUUID, Matches } from 'class-validator';

export class PartnerDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    description: string;

    @IsString()
    tags: string;

    @IsUrl()
    image_url: string;

    @IsUrl()
    web_url: string;

    @IsBoolean()
    active: boolean;

    @IsUUID(undefined)
    @IsNotEmpty()
    business_id: string;

}