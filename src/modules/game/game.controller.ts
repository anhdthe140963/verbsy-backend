import { Controller, Get, HttpStatus, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/decorator/get-user-decorator';
import { RolesGuard } from 'src/guards/roles.guard';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}
  @UseGuards(AuthGuard(), RolesGuard)
  @Get('active-games')
  async findActiveGames(
    @GetUser() user,
  ): Promise<{ statusCode; error; message; data }> {
    return {
      statusCode: HttpStatus.OK,
      error: null,
      message: 'Get active games successfully',
      data: await this.gameService.findActiveGames(user),
    };
  }
}
