import { OmitType } from '@nestjs/swagger';
import { User } from '../entity/user.entity';

export class GetUserDto extends OmitType(User, ['password', 'salt'] as const) {}
