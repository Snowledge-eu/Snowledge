import { PartialType } from '@nestjs/swagger';
import { CreateXrplDto } from './create-xrpl.dto';

export class UpdateXrplDto extends PartialType(CreateXrplDto) {}
