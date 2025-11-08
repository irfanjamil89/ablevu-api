import { IsString, IsNotEmpty, IsArray, ArrayNotEmpty, IsUUID, IsBoolean } from 'class-validator';

export class AccessibleFeatureDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsArray()
    @ArrayNotEmpty()
    @IsUUID(undefined, { each: true })
    accessible_feature_types: string[];

    @IsBoolean()
    active: boolean;
}
