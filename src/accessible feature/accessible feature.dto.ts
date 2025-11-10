import { IsString, IsNotEmpty, IsArray, ArrayNotEmpty, IsUUID, IsBoolean } from 'class-validator';

export class AccessibleFeatureDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsArray()
    @ArrayNotEmpty()
    @IsUUID(undefined, { each: true })
    accessible_feature_types: string[];

    @IsArray()
    @ArrayNotEmpty()
    @IsUUID(undefined, { each: true })
    business_type: string[];

    @IsBoolean()
    active: boolean;
}
