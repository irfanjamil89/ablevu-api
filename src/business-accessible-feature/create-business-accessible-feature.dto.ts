// dto/create-business-accessible-feature.dto.ts
import {
  IsUUID,
  IsNotEmpty,
  IsArray,
  ArrayNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateBusinessAccessibleFeatureDto {
  @IsUUID()
  @IsNotEmpty()
  business_id: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsUUID(undefined, { each: true })
  accessible_feature_ids: string[];

  @IsString()
  @IsOptional()
  optional_answer?: string;
}
