import { PartialType } from '@nestjs/swagger';
import { CreateUserClassDto } from './create-user-class.dto';

export class UpdateUserClassDto extends PartialType(CreateUserClassDto) {}
