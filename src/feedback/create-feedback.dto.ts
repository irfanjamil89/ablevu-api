import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateFeedbackDto{

    @IsString()
    @IsOptional()
    business_id: string;

    @IsString()
    @IsNotEmpty()
   feedback_type_id: string;

    @IsString()
    @IsNotEmpty()
    comment:string;

    @IsBoolean()
    @IsOptional()
    active: boolean;

}