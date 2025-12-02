import { IsBoolean, IsOptional, IsString } from "class-validator";

export class UpdateFeedbackDto{

    @IsString()
    @IsOptional()
    business_id: string;

    @IsString()
    @IsOptional()
    feedback_type_id: string;

    @IsString()
    @IsOptional()
    comment:string;

    @IsBoolean()
    @IsOptional()
    active: boolean;

}