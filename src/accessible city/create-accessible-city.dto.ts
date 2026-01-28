import { IsBoolean, IsNumber, IsOptional, IsString, IsUrl, IsArray, ArrayNotEmpty, IsUUID } from 'class-validator';

export class CreateAccessibleCityDto {
  @IsString()
  cityName: string;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsUUID("all", { each: true })
  business_Ids: string[];

  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @IsOptional()
  @IsUrl()
  pictureUrl?: string;

  @IsString()
  externalId: string;
}
