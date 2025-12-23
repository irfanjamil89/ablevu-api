import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateSubscriptionDto {
  @IsUUID()
  @IsOptional()
  business_id: string;

  @IsString()
  @IsNotEmpty()
  price_id: string; // price_...

  @IsString()
  @IsNotEmpty()
  package: string; // monthly/yearly label
}
