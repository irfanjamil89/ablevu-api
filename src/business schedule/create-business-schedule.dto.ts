import { IsNotEmpty, IsOptional, IsString, IsBoolean, IsArray, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
export class CreateScheduleDto {
    
    @IsString()
    @IsNotEmpty()
    businessId: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ScheduleItem)
    schedules: ScheduleItem[];
}
class ScheduleItem{
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
