import { IsOptional, IsString } from 'class-validator';

export class UpdateBusinessSaveDto {

  @IsOptional()
  @IsString()
  note?: string;
}
