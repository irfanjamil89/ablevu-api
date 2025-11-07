import {IsBoolean, IsNumber, IsOptional, IsString, IsUrl} from 'class-validator';

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

  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @IsOptional()
  @IsUrl()
  pictureUrl?: string;
}
