import { Body, Controller, Get, HttpStatus, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/guards/roles.guard';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}
  @UseGuards(AuthGuard(), RolesGuard)
  @Get('active-games')
  async findActiveGames(
    @Body() dto: { classId: number },
  ): Promise<{ statusCode; error; message; data }> {
    return {
      statusCode: HttpStatus.OK,
      error: null,
      message: 'Get active games successfully',
      data: await this.gameService.findActiveGames(dto.classId),
    };
  }
}
