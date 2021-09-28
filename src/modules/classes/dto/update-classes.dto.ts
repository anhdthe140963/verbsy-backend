import { PartialType } from '@nestjs/swagger';
import { CreateClassDto } from './create-classes.dto';

export class UpdateClassDto extends PartialType(CreateClassDto) {}
