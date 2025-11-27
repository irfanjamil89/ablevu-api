import {
  IsOptional,
  IsString,
  IsEmail,
  IsNumber,
  IsArray,
  IsUUID,
  IsBoolean,
} from 'class-validator';

export class UpdateBusinessDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  business_type?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  accessible_feature_id?: string[];

  @IsOptional()
  @IsUUID()
  accessible_city_id?: string;

  @IsOptional()
  @IsString()
  description?: string;

  // ⭐ Option A: user may only update full formatted address
  @IsOptional()
  @IsString()
  address?: string;

  // Backend geocoder will overwrite these if address changes
  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  zipcode?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone_number?: string;

  @IsOptional()
  @IsString()
  facebook_link?: string;

  @IsOptional()
  @IsString()
  instagram_link?: string;

  @IsOptional()
  @IsString()
  logo_url?: string;

  @IsOptional()
  @IsString()
  marker_image_url?: string;

  // ⭐ Google Maps — Optional
  @IsOptional()
  @IsString()
  place_id?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  promo_code?: string;
}
