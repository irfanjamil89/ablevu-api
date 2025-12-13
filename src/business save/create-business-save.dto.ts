import { IsUUID, IsOptional, IsString } from 'class-validator';

export class CreateBusinessSaveDto {

  @IsUUID()
  business_id: string;

  @IsOptional()
  @IsString()
  note?: string;
}
