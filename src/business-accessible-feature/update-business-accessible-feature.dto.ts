import { IsBoolean, IsOptional, IsString, IsArray, IsUUID } from 'class-validator';

export class UpdateBusinessAccessibleFeatureDto {
    @IsArray()
    @IsOptional()
    @IsUUID(undefined, { each: true })
    accessible_feature_id: string[];

    @IsBoolean()
    @IsOptional()
    active?: boolean;

    @IsString()
    @IsOptional()
    optional_answer?: string;
}
