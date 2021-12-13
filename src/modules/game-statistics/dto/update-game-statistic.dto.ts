import { PartialType } from '@nestjs/swagger';
import { CreateGameStatisticDto } from './create-game-statistic.dto';

export class UpdateGameStatisticDto extends PartialType(CreateGameStatisticDto) {}
