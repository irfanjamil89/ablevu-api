import { IsString, IsOptional, IsObject } from "class-validator";

export class CreateSubscriptionDto {
  @IsString()
  price_id: string;

  @IsString()
  package: string; // monthly/yearly

  // ✅ draft payload from frontend
  @IsObject()
  businessDraftPayload: any;

  @IsOptional()
  @IsString()
  businessImageBase64?: string;
}
