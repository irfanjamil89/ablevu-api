import { IsOptional, IsString, IsEmail, IsNumber, IsArray, ArrayNotEmpty, IsUUID, IsBoolean, IsNotEmpty } from 'class-validator';

export class CreateBusinessDto {
  @IsString()
  name: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsUUID(undefined, { each: true })
  business_type: string[];

  @IsArray()
  @ArrayNotEmpty()
  @IsUUID(undefined, { each: true })
  accessible_feature_id: string[];

  @IsString()
  @IsNotEmpty()
  @IsUUID(undefined, { each: true })
  accessible_city_id: string;

  @IsString()
  description?: string;

  @IsString()
  address?: string;

  @IsString()
  city?: string;

  @IsString()
  state?: string;

  @IsString()
  country?: string;

  @IsString()
  zipcode?: string;

  @IsBoolean()
  active: boolean;

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

  @IsOptional()
  @IsString()
  externla_id?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  creatorId?: string;

  @IsOptional()
  @IsString()
  owner_user_id?: string;

  @IsOptional()
  @IsNumber()
  views?: number;


}
