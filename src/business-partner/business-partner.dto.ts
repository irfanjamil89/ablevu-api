import { IsUUID, IsNotEmpty } from "class-validator";

export class BusinessPartnerDto {

    @IsUUID(undefined)
    @IsNotEmpty()
    partner_id: string;

}