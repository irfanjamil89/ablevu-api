import { IsBoolean, IsOptional, IsString } from "class-validator";

export class UpdateBusinessQuestionsDto{

    @IsString()
    @IsOptional()
    business_id: string;

    @IsString()
    @IsOptional()
    question: string;

    @IsOptional()
    @IsString()
    answer: string;

    @IsOptional()
    @IsBoolean()
    active: boolean;

    @IsOptional()
    @IsBoolean()
    show_name: boolean;
}