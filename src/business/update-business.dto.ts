import { CreateBusinessDto } from './create-business.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateBusinessDto extends PartialType(CreateBusinessDto) {}