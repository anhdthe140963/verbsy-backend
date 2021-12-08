import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { GameStatisticsService } from './game-statistics.service';

@Controller('game-statistics')
export class GameStatisticsController {
  constructor(private readonly gameStatisticsService: GameStatisticsService) {}

  @Get('summary/:gameId')
  async getGameSummary(@Param('gameId') gameId: number) {
    const summary = await this.gameStatisticsService.getSummary(gameId);
    return {
      status: HttpStatus.OK,
      message: 'h',
      data: summary,
    };
  }
}
