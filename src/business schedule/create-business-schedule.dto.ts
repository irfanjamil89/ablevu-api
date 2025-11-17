import { IsNotEmpty, IsOptional, IsString, IsBoolean } from "class-validator";

export class CreateScheduleDto {
    
    @IsString()
    @IsNotEmpty()
    businessId: string;

   @IsString()
   @IsNotEmpty()
   day: string;

   @IsString()
   @IsNotEmpty()
   opening_time: string;

   @IsString()
   @IsNotEmpty()
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
