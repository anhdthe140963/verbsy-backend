import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/decorator/get-user-decorator';
import { RolesGuard } from 'src/guards/roles.guard';
import { User } from '../user/entity/user.entity';
import { GameStatisticsService } from './game-statistics.service';

@UseGuards(AuthGuard(), RolesGuard)
@Controller('game-statistics')
export class GameStatisticsController {
  constructor(private readonly gameStatisticsService: GameStatisticsService) {}

  @Get('latest-game')
  @UseGuards(AuthGuard(), RolesGuard)
  async getLatestGameSummary(@GetUser() user: User) {
    const game = await this.gameStatisticsService.getLatestGame(user.id);
    const generalInfo = await this.gameStatisticsService.getGameGeneralInfo(
      game.id,
    );
    const leaderboard = await this.gameStatisticsService.getLeaderboard(
      game.id,
    );
    const completionRate =
      await this.gameStatisticsService.getGameCompletionRate(game.id);
    return {
      status: HttpStatus.OK,
      message: 'h',
      data: {
        summary: generalInfo,
        leaderboard,
        completionRate,
      },
    };
  }

  @Get('games/:lectureId')
  async getGamesOfLecture(@Param('lectureId') lectureId: number) {
    const games = await this.gameStatisticsService.getGamesOfLecture(lectureId);
    return {
      status: HttpStatus.OK,
      message: 'h',
      data: games,
    };
  }

  @Get('leaderboard/:gameId')
  async getLeaderboard(@Param('gameId') gameId: number) {
    const leaderboard = await this.gameStatisticsService.getLeaderboard(gameId);
    return {
      status: HttpStatus.OK,
      message: 'h',
      data: {
        leaderboard,
      },
    };
  }

  @Get('summary/:gameId')
  async getGameSummary(@Param('gameId') gameId: number) {
    const generalInfo = await this.gameStatisticsService.getGameGeneralInfo(
      gameId,
    );
    const leaderboard = await this.gameStatisticsService.getLeaderboard(gameId);
    const completionRate =
      await this.gameStatisticsService.getGameCompletionRate(gameId);
    return {
      status: HttpStatus.OK,
      message: 'h',
      data: {
        summary: generalInfo,
        leaderboard,
        completionRate,
      },
    };
  }

  @Get('player/:playerId')
  async getPlayerDetailedStats(@Param('playerId') playerId: number) {
    const playerData = await this.gameStatisticsService.getPlayerDetailedStats(
      playerId,
    );
    return {
      status: HttpStatus.OK,
      message: 'h',
      data: playerData,
    };
  }

  @Get('questions/:gameId')
  async getGameQuesitons(@Param('gameId') gameId: number) {
    const questions = await this.gameStatisticsService.getGameQuestions(gameId);
    return {
      status: HttpStatus.OK,
      message: 'h',
      data: questions,
    };
  }

  @Get('question/:gameId/:questionId')
  async getQuestionDetailedStats(
    @Param('gameId') gameId: number,
    @Param('questionId') questionId: number,
  ) {
    const questionStats =
      await this.gameStatisticsService.getQuestionDetailedStats(
        gameId,
        questionId,
      );
    return {
      status: HttpStatus.OK,
      message: 'h',
      data: questionStats,
    };
  }

  @Get('class/game/:gameId')
  async getGameAttendance(
    @GetUser() user: User,
    @Param('gameId') gameId: number,
  ) {
    const gameAttendance = await this.gameStatisticsService.getGameAttendance(
      gameId,
    );
    return {
      status: HttpStatus.OK,
      message: 'h',
      data: gameAttendance,
    };
  }

  @Get('class/:classId')
  async getClassStats(
    @GetUser() user: User,
    @Param('classId') classId: number,
  ) {
    const classGeneralInfo =
      await this.gameStatisticsService.getClassGeneralInfo(user.id, classId);

    const classAttendance = await this.gameStatisticsService.getClassAttendance(
      user.id,
      classId,
    );

    const classScoreStats = await this.gameStatisticsService.getClassScoreStats(
      user.id,
      classId,
    );
    return {
      status: HttpStatus.OK,
      message: 'h',
      data: { classGeneralInfo, classAttendance, classScoreStats },
    };
  }
}
