import {  IsOptional, IsString, IsBoolean } from "class-validator";

export class UpdateScheduleDto {
    
    @IsString()
    @IsOptional()
    businessId: string;

   @IsString()
   @IsOptional()
   day: string;

   @IsString()
   @IsOptional()
   opening_time: string;

   @IsString()
   @IsOptional()
   closing_time: string;

   @IsString()
   @IsOptional()
   opening_time_text: string;

   @IsString()
   @IsOptional()
   closing_time_text: string;

    @IsBoolean()
    @IsOptional()
    active?: boolean;
}
