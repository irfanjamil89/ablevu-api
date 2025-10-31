import { IsNotEmpty, IsString, IsUrl, Matches } from 'class-validator';

export class PartnerDto {
    @IsString()
    @IsNotEmpty()
    Partner_Name: string;

    @IsUrl()
    @IsNotEmpty()
    Website: string;

    @Matches(/^\+?[1-9]\d{1,14}$/)
    Contact_Person?: string;

}