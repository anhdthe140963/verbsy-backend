import { Controller, Get, HttpStatus, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from 'src/constant/role.enum';
import { GetUser } from 'src/decorator/get-user-decorator';
import { Roles } from 'src/decorator/roles.decorator';
import { RolesGuard } from 'src/guards/roles.guard';
import { Game } from './entities/game.entity';
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

  @UseGuards(AuthGuard(), RolesGuard)
  @Get('curriculum/:curriculumId')
  async getGamesOfCurriculum(
    @Param('curriculumId') curirculumId: number,
  ): Promise<{ statusCode: HttpStatus; message: string; data: Game[] }> {
    const games = await this.gameService.getGamesOfCurriculum(curirculumId);

    return {
      statusCode: HttpStatus.OK,
      message: 'Get games of curriculum successfully',
      data: games,
    };
  }

  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(Role.Administrator, Role.Teacher)
  @Get('games/:lectureId')
  async getGamesByLectureId(@Param('lectureId') lectureId: number): Promise<{
    statusCode: HttpStatus;
    message: string;
    data: Game[];
  }> {
    return {
      statusCode: HttpStatus.OK,
      message: 'Get games successfully',
      data: await this.gameService.getGamesByLectureId(lectureId),
    };
  }

  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(Role.Administrator, Role.Teacher)
  @Get('game-history/:gameId')
  async getGameHistoryByGameId(
    @Param('gameId') gameId: number,
  ): Promise<{ statusCode; message; data }> {
    return {
      statusCode: HttpStatus.OK,
      message: 'Get game history succesfully',
      data: await this.gameService.getGameHistoryByGameId(gameId),
    };
  }

  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(Role.Teacher)
  @Get('teacher-games')
  async getTeacherActiveGames(
    @GetUser() user,
  ): Promise<{ statusCode; message; data }> {
    return {
      statusCode: HttpStatus.OK,
      message: 'Get teacher active games successfully',
      data: await this.gameService.getTeacherActiveGames(user),
    };
  }

  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(Role.Teacher)
  @Get('recent-game')
  async getRecentGameStatistic(
    @GetUser() user,
  ): Promise<{ statusCode; message; data }> {
    return {
      statusCode: HttpStatus.OK,
      message: 'Get recent game successfully',
      data: await this.gameService.getTeacherRecentGame(user),
    };
  }
}
