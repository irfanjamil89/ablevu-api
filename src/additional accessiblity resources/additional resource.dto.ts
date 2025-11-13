import { IsString, IsNotEmpty, IsUUID, IsBoolean } from 'class-validator';

export class AdditionalResourceDto {
    @IsUUID(undefined)
    business_id: string;

    @IsString()
    @IsNotEmpty()
    label: string;

    @IsString()
    @IsNotEmpty()
    link: string;

    @IsBoolean()
    active: boolean;

}
