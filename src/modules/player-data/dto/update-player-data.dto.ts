import { PartialType } from '@nestjs/mapped-types';
import { CreatePlayerDataDto } from './create-player-data.dto';

export class UpdatePlayerDataDto extends PartialType(CreatePlayerDataDto) {}
