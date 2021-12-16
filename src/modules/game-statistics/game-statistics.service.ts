import { BadRequestException, Injectable } from '@nestjs/common';
import { paginateRaw } from 'nestjs-typeorm-paginate';
import { QuestionLevel } from 'src/constant/question-level.enum';
import { QuestionType } from 'src/constant/question-type.enum';
import { In, Like, Not } from 'typeorm';
import { BlacklistRepository } from '../blacklist/repository/blacklist.repository';
import { Classes } from '../classes/entity/classes.entity';
import { ClassesRepository } from '../classes/repository/classes.repository';
import { Lesson } from '../curriculum/entities/lesson.entity';
import { CurriculumRepository } from '../curriculum/repository/curriculum.repository';
import { GameServerService } from '../game-server/game-server.service';
import { GameRepository } from '../game/repositoty/game.repository';
import { LectureRepository } from '../lecture/repository/lecture.repository';
import { LessonRepository } from '../lesson/repository/lesson.repository';
import { PlayerDataRepository } from '../player-data/repository/player-data.repository';
import { Player } from '../player/entities/player.entity';
import { PlayerRepository } from '../player/repository/player.repository';
import { QuestionRecordRepository } from '../question-record/repository/question-record.repository';
import { QuestionTypeConfig } from '../question-type-config/entities/question-type-config.entity';
import { QuestionTypeConfigRepository } from '../question-type-config/repository/question-type-config.repository';
import { Answer } from '../question/entity/answer.entity';
import { Question } from '../question/entity/question.entity';
import { AnswerRepository } from '../question/repository/answer.repository';
import { QuestionRepository } from '../question/repository/question.repository';
import { SchoolYear } from '../school-year/entities/school-year.entity';
import { UserClassRepository } from '../user-class/repository/question.repository';
import { User } from '../user/entity/user.entity';
import { UserRepository } from '../user/repository/user.repository';

@Injectable()
export class GameStatisticsService {
  constructor(
    private readonly gameRepository: GameRepository,
    private readonly playerRepository: PlayerRepository,
    private readonly playerDataRepository: PlayerDataRepository,
    private readonly questionTypeConfigRepository: QuestionTypeConfigRepository,
    private readonly questionRepository: QuestionRepository,
    private readonly questionRecordRepository: QuestionRecordRepository,
    private readonly answerRepository: AnswerRepository,
    private readonly userRepository: UserRepository,
    private readonly userClassRepository: UserClassRepository,
    private readonly lectureRepository: LectureRepository,
    private readonly classesRepository: ClassesRepository,
    private readonly curriculumRepository: CurriculumRepository,
    private readonly lessonRepository: LessonRepository,
    private readonly blacklistRepository: BlacklistRepository,
  ) {}

  convertTime(timeInMs: number): string {
    const time = timeInMs / 1000;

    const hours = Math.floor(time / 3600);
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time - minutes * 60);

    return hours != 0
      ? hours + ' hours ' + minutes + ' minutes ' + seconds + ' seconds'
      : minutes != 0
      ? minutes + ' minutes ' + seconds + ' seconds'
      : seconds + ' seconds';
  }

  async getPlayersIdsOfGame(gamesIds: number[]) {
    const players = await this.playerRepository.find({
      where: { gameId: In(gamesIds) },
    });
    const playersIds = [];
    for (const p of players) {
      playersIds.push(p.id);
    }
    return playersIds;
  }

  async getLatestGame(hostId: number) {
    return await this.gameRepository.findOne({
      where: { hostId: hostId },
      order: { endedAt: 'DESC' },
    });
  }

  async getGamesOfLecture(lectureId: number) {
    const lecture = await this.lectureRepository.findOne(lectureId);

    const games = await this.gameRepository
      .createQueryBuilder('g')
      .leftJoin(User, 'u', 'g.host_id = u.id')
      .leftJoin(Classes, 'cl', 'g.class_id = cl.id')
      .select('g.id', 'id')
      .addSelect('u.full_name', 'hostName')
      .addSelect('cl.id', 'classId')
      .addSelect('cl.name', 'className')
      .addSelect('g.questions_config', 'questionsConfig')
      .addSelect('g.created_at', 'createdAt')
      .where('g.lecture_id =:lectureId', { lectureId })
      .andWhere('g.is_game_live = false')
      .orderBy('g.created_at', 'DESC')
      .getRawMany();

    for (const g of games) {
      const game: {
        id: number;
        hostName: string;
        classId: number;
        className: string;
        createdAt: Date;
        joined: string;
        questionsConfig: {
          questions: number;
          questionTypes: QuestionType[];
          timeFactorWeight: number;
        };
        completionRate: any;
      } = g;
      game.joined =
        (await this.playerRepository.count({
          where: { gameId: game.id },
        })) +
        '/' +
        (await this.userClassRepository.count({
          where: { classId: game.classId, teacherId: null },
        }));
      game.completionRate = await this.getGameCompletionRate(game.id);
    }

    return {
      lectureId: lecture.id,
      lectureName: lecture.name,
      count: games.length,
      games,
    };
  }

  // async getPaginatedGamesOfLecture(lectureId: number) {
  //   const lecture = await this.lectureRepository.findOne(lectureId);

  //   const games = await this.gameRepository
  //     .createQueryBuilder('g')
  //     .leftJoin(User, 'u', 'g.host_id = u.id')
  //     .leftJoin(Classes, 'cl', 'g.class_id = cl.id')
  //     .select('g.id', 'id')
  //     .addSelect('u.full_name', 'hostName')
  //     .addSelect('cl.id', 'classId')
  //     .addSelect('cl.name', 'className')
  //     .addSelect('g.questions_config', 'questionsConfig')
  //     .addSelect('g.created_at', 'createdAt')
  //     .where('g.lecture_id =:lectureId', { lectureId })
  //     .andWhere('g.is_game_live = false')
  //     .orderBy('g.created_at', 'DESC');

  //   const paginated = paginateRaw<{
  //     id: number;
  //     hostName: string;
  //     classId: number;
  //     className: string;
  //     createdAt: Date;
  //     questionsConfig: {
  //       questions: number;
  //       questionTypes: QuestionType[];
  //       timeFactorWeight: number;
  //     };
  //   }>(games, { page: 1, limit: 10 });

  //   for (const g of (await paginated).items) {
  //     const game: {
  //       id: number;
  //       hostName: string;
  //       classId: number;
  //       className: string;
  //       createdAt: Date;
  //       joined: string;
  //       questionsConfig: {
  //         questions: number;
  //         questionTypes: QuestionType[];
  //         timeFactorWeight: number;
  //       };
  //     } = g;
  //     game.joined =
  //       (await this.playerRepository.count({
  //         where: { gameId: game.id },
  //       })) +
  //       '/' +
  //       (await this.userClassRepository.count({
  //         where: { classId: game.classId, teacherId: null },
  //       }));
  //   }

  //   return {
  //     lectureId: lecture.id,
  //     lectureName: lecture.name,
  //     count: games.length,
  //     games,
  //   };
  // }

  async getGameGeneralInfo(gameId: number) {
    const game = await this.gameRepository.findOne(gameId);
    //Game duration in seconds
    const time = (game.endedAt.getTime() - game.createdAt.getTime()) / 1000;

    // const time = 75;

    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time - minutes * 60);

    const players = await this.playerRepository.count({ where: { gameId } });
    const playersInClass = await this.userClassRepository.count({
      where: { teacherId: null, classId: game.classId },
    });

    const questions = await this.questionTypeConfigRepository.find({
      where: { gameId },
    });

    const questionIds = [];
    for (const q of questions) {
      questionIds.push(q.questionId);
    }

    const easy = await this.questionRepository.count({
      where: { id: In(questionIds), level: QuestionLevel.Easy },
    });
    const medium = await this.questionRepository.count({
      where: { id: In(questionIds), level: QuestionLevel.Medium },
    });
    const hard = await this.questionRepository.count({
      where: { id: In(questionIds), level: QuestionLevel.Hard },
    });

    const lecture = await this.lectureRepository.findOne(game.lectureId);
    const cl = await this.classesRepository.findOne(game.classId);

    let lesson: Lesson;
    if (game.lessonId) {
      lesson = await this.lessonRepository.findOne(game.lessonId);
    }

    return {
      gameId: game.id,
      curriculumId: game.lessonId ? lesson.curriculumId : null,
      lessonId: game.lessonId,
      classId: game.classId,
      className: cl.name,
      lectureId: lecture.id,
      lectureName: lecture.name,
      players: players + `/` + playersInClass,
      questions: {
        easy,
        medium,
        hard,
        total: easy + medium + hard,
      },
      time: minutes
        ? minutes + ' minutes ' + seconds + ' seconds'
        : seconds + ' seconds',
      createdAt: game.createdAt,
    };
  }

  async getAnswerStatistics(gameId: number, questionId: number) {
    const question = await this.questionRepository.findOne(questionId);
    const questionTypeConfig = await this.questionTypeConfigRepository.findOne({
      where: { gameId, questionId },
    });

    if (!questionTypeConfig) {
      throw new BadRequestException('Question not in game');
    }

    const players = await this.playerRepository.find({ where: { gameId } });
    const playersIds = [];
    for (const player of players) {
      playersIds.push(player.id);
    }
    let answerStats = [];
    switch (questionTypeConfig.questionType) {
      case QuestionType.MultipleChoice:
        for (const answer of question.answers) {
          const count = await this.playerDataRepository.count({
            where: { playerId: In(playersIds), answerId: answer.id },
          });
          answerStats.push({ ...answer, count });
        }
        break;
      case QuestionType.Scramble:
      case QuestionType.Writting:
        const correctAnswers = await this.answerRepository.find({
          where: { question: { id: questionId }, isCorrect: true },
        });

        for (const a of correctAnswers) {
          const correctAnswerCount = await this.playerDataRepository.count({
            where: {
              answer: Like(a.content),
              playerId: In(playersIds),
              questionId,
            },
          });
          answerStats.push({
            id: null,
            answer: a.content,
            isCorrect: true,
            count: correctAnswerCount,
          });
        }

        const incorrectAnswers = await this.playerDataRepository
          .createQueryBuilder('pd')
          .select('pd.answer_id', 'id')
          .addSelect('pd.answer', 'answer')
          .addSelect('pd.is_correct', 'isCorrect')
          .addSelect('COUNT(*)', 'count')
          .where('pd.player_id IN(:playersIds)', {
            playersIds,
          })
          .andWhere('pd.question_id = :questionId', { questionId })
          .andWhere('pd.is_correct = false')
          .andWhere('pd.answer IS NOT null')
          .groupBy('pd.answer_id')
          .addGroupBy('pd.answer')
          .addGroupBy('pd.is_correct')
          .getRawMany();

        answerStats = answerStats.concat(incorrectAnswers);
        // const playersData = await this.playerDataRepository.find({
        //   where: { playerId: In(playersIds), questionId: questionId },
        // });

        // for (const pd of playersData) {

        // }

        // for (const a of playerDatas) {
        //   const answerStat = a as {
        //     id: number;
        //     answer: string;
        //     isCorrect: boolean;
        //     count: number;
        //   };
        //   answerStats.push(answerStat);
        // }
        break;
    }

    // answerStats.push();

    return {
      answered: answerStats,
      ...{
        noAnswer: await this.playerDataRepository.count({
          where: {
            playerId: In(playersIds),
            questionId: question.id,
            answer: null,
          },
        }),
      },
    };
  }

  async getLeaderboard(gameId: number): Promise<
    {
      id: number;
      playerId: number;
      username: string;
      fullName: string;
      score: string;
    }[]
  > {
    const records = await this.playerDataRepository
      .createQueryBuilder('pd')
      .leftJoinAndSelect(Player, 'pl', 'pd.player_id = pl.id')
      .leftJoinAndSelect(User, 'u', 'pl.student_id = u.id')
      .select('SUM(pd.score)', 'score')
      .addSelect('u.full_name', 'fullName')
      .addSelect('u.id', 'id')
      .addSelect('pl.id', 'playerId')
      .addSelect('u.username', 'username')
      .where('pl.game_id = :gameId', { gameId: gameId })
      .groupBy('pd.player_id')
      .orderBy('score', 'DESC')
      .getRawMany();

    return records;
  }

  async getGameCompletionRate(gameId: number) {
    const players = await this.playerRepository.find({ where: { gameId } });

    const playersIds = [];
    for (const p of players) {
      playersIds.push(p.id);
    }

    const playersData = await this.playerDataRepository.find({
      where: { playerId: In(playersIds) },
    });

    let correct = 0;
    let incorrect = 0;
    let notAnswered = 0;
    for (const p of playersData) {
      switch (p.isCorrect) {
        case null:
          notAnswered++;
          break;
        case true:
          correct++;
          break;
        case false:
          incorrect++;
          break;
      }
    }

    return {
      correct,
      incorrect,
      notAnswered,
    };
  }

  async getPlayerDetailedStats(playerId: number) {
    const player = await this.playerRepository.findOne(playerId);

    // const user = await this.userRepository.findOne(player.studentId);

    // const playerData = await this.playerDataRepository.find({
    //   where: { playerId: player.id },
    // });

    const playerData = await this.playerDataRepository
      .createQueryBuilder('pd')
      .innerJoin(Question, 'q', 'pd.question_id = q.id')
      .leftJoin(QuestionTypeConfig, 'qtc', 'pd.question_id = qtc.question_id')
      .select('qtc.question_id', 'id')
      .addSelect('pd.question', 'question')
      .addSelect('q.level', 'difficulty')
      .addSelect('qtc.question_type', 'questionType')
      .addSelect('pd.answer', 'answer')
      .addSelect('pd.is_correct', 'isCorrect')
      .addSelect('pd.answer_time', 'answerTime')
      .addSelect('pd.score', 'score')
      .where('pd.player_id =:playerId', { playerId: player.id })
      .andWhere('qtc.game_id =:gameId', { gameId: player.gameId })
      .getRawMany();

    const answeredQuesitonsIds = [];
    for (const pd of playerData) {
      answeredQuesitonsIds.push(pd.questionId);
    }

    const leaderboard = await this.getLeaderboard(player.gameId);
    const leaderboardInfo = leaderboard.find((l) => {
      return l.playerId == player.id;
    });
    const generalInfo = {
      ...leaderboardInfo,
      rank: leaderboard.indexOf(leaderboardInfo) + 1 + '/' + leaderboard.length,
    };

    return {
      generalInfo,
      questions: playerData,
    };
  }

  async getQuestionDetailedStats(gameId: number, questionId: number) {
    // const question = await this.questionRepository.findOne({
    //   where: { id: questionId },
    //   select: ['id', 'question'],
    //   loadEagerRelations: false,
    // });

    const question = await this.questionRepository
      .createQueryBuilder('q')
      .innerJoin(QuestionTypeConfig, 'qtc', 'q.id = qtc.question_id')
      .select('q.id', 'id')
      .addSelect('q.question', 'question')
      .addSelect('q.level', 'difficulty')
      .addSelect('qtc.question_type', 'questionType')
      .where('qtc.game_id =:gameId', { gameId })
      .andWhere('qtc.question_id =:questionId', { questionId })
      .getRawOne();

    const answersStats = await this.getAnswerStatistics(gameId, questionId);

    const players = await this.playerRepository.find({ where: { gameId } });
    const playersIds = [];
    for (const p of players) {
      playersIds.push(p.id);
    }

    // const playersData = await this.playerDataRepository.find({
    //   where: { playerId: In(playersIds), questionId },
    // });

    const averageAnswerTime = await this.playerDataRepository
      .createQueryBuilder('pd')
      .select('AVG(pd.answer_time)', 'averageAnswerTime')
      .where('pd.player_id IN(:playersIds)', { playersIds })
      .andWhere('pd.question_id =:questionId', { questionId })
      .getRawOne();

    const playersData = await this.playerDataRepository
      .createQueryBuilder('pd')
      .leftJoin(Player, 'pl', 'pd.player_id = pl.id')
      .leftJoin(User, 'u', 'pl.student_id = u.id')
      .select('u.id', 'id')
      .addSelect('u.full_name', 'fullName')
      .addSelect('pd.answer', 'answer')
      .addSelect('pd.is_correct', 'isCorrect')
      .addSelect('pd.answer_time', 'answerTime')
      .addSelect('pd.score', 'score')
      .where('pd.player_id IN(:playersIds)', { playersIds })
      .andWhere('pd.question_id =:questionId', { questionId })
      .getRawMany();
    return {
      ...question,
      answers: answersStats,
      summary: {
        completionRate: await this.getQuestionCompletionRate(
          gameId,
          questionId,
        ),
        averageAnswerTime: Number.parseFloat(
          averageAnswerTime.averageAnswerTime,
        ),
        answeredPlayers:
          playersData.length - answersStats.noAnswer + '/' + playersData.length,
      },
      playersData,
    };
  }

  async getGameQuestions(gameId: number) {
    const questions = await this.questionRecordRepository
      .createQueryBuilder('qr')
      .leftJoin(QuestionTypeConfig, 'qtc', 'qr.question_id = qtc.question_id')
      .leftJoin(Question, 'q', 'qr.question_id = q.id')
      .select('qr.id', 'id')
      .addSelect('q.id', 'questionId')
      .addSelect('q.question', 'question')
      .addSelect('qtc.question_type', 'questionType')
      .addSelect('q.duration', 'duration')
      .addSelect('q.level', 'difficulty')
      .where('qr.game_id = :gameId', { gameId })
      .andWhere('qtc.game_id = :gameId', { gameId })
      .getRawMany();

    for (const q of questions) {
      const question: {
        id: number;
        questionId: number;
        question: string;
        questionType: QuestionType;
        duration: number;
        difficulty: QuestionLevel;
        answers: any;
        completionRate: any;
      } = q;
      question.answers = await this.getAnswerStatistics(
        gameId,
        question.questionId,
      );
      question.completionRate = await this.getQuestionCompletionRate(
        gameId,
        question.questionId,
      );
    }

    return questions;
  }

  async getQuestionCompletionRate(gameId: number, questionId: number) {
    const players = await this.playerRepository.find({ where: { gameId } });

    const playersIds = [];
    for (const p of players) {
      playersIds.push(p.id);
    }

    const playersData = await this.playerDataRepository.find({
      where: { playerId: In(playersIds), questionId: questionId },
    });

    let correct = 0;
    let incorrect = 0;
    let notAnswered = 0;
    for (const p of playersData) {
      switch (p.isCorrect) {
        case null:
          notAnswered++;
          break;
        case true:
          correct++;
          break;
        case false:
          incorrect++;
          break;
      }
    }

    return {
      correct,
      incorrect,
      notAnswered,
    };
  }

  async getNeedHelpPlayers(gameId: number) {
    return gameId;
  }

  async getClassAttendance(teacherId: number, classId: number) {
    const attendance = await this.gameRepository
      .createQueryBuilder('g')
      .innerJoin(Player, 'p', 'g.id = p.game_id')
      .innerJoin(Lesson, 'l', 'g.lesson_id = l.id')
      .select('g.id', 'gameId')
      .addSelect('l.curriculum_id', 'curriculumId')
      .addSelect('l.id', 'lessonId')
      .addSelect('l.name', 'lessonName')
      .addSelect('g.created_at', 'createdAt')
      .addSelect('COUNT(p.id)', 'playersJoined')
      .where('g.host_id =:teacherId', { teacherId })
      .andWhere('g.class_id =:classId', { classId })
      .groupBy('gameId')
      .orderBy('createdAt')
      .getRawMany();

    return attendance;
  }

  async getClassScoreStats(teacherId: number, classId: number) {
    const games = await this.gameRepository.find({
      where: { classId, hostId: teacherId },
    });

    const scores = [];
    for (const g of games) {
      const lesson = await this.lessonRepository.findOne(g.lessonId);
      const leaderboard = await this.getLeaderboard(g.id);
      let totalScore = 0;
      for (const l of leaderboard) {
        totalScore += Number.parseInt(l.score);
      }
      scores.push({
        gameId: g.id,
        curriculumId: lesson.curriculumId,
        lessonId: lesson.id,
        lessonName: lesson.name,
        createdAt: g.createdAt,
        highestScore: Number.parseInt(
          leaderboard[0] ? leaderboard[0].score : '0',
        ),
        averageScore: Math.floor(totalScore / leaderboard.length),
        lowestScore: Number.parseInt(
          leaderboard[leaderboard.length - 1]
            ? leaderboard[leaderboard.length - 1].score
            : '0',
        ),
      });
    }

    return scores;
  }

  async getGameAverageScore(
    gameId: number,
  ): Promise<{ gameId: number; averageScore: number; maxScore: number }> {
    const game = await this.gameRepository.findOne(gameId);
    const gameConfig = game.questionsConfig;

    const totalQuestion = await this.questionRecordRepository.count({
      where: { gameId },
    });

    const maxPossibleScore =
      totalQuestion * 100 * (1 + gameConfig.timeFactorWeight);

    const playersIds = await this.getPlayersIdsOfGame([game.id]);
    const totalScore = await this.playerDataRepository
      .createQueryBuilder('pd')
      .select('SUM(pd.score)', 'totalScore')
      .where('pd.player_id IN(:playersIds)', {
        playersIds: playersIds.toString(),
      })
      .getRawOne();

    return {
      gameId: game.id,
      averageScore: Number.parseInt(totalScore.totalScore) / playersIds.length,
      maxScore: maxPossibleScore,
    };
  }

  async getClassGeneralInfo(teacherId: number, classId: number) {
    const cl = await this.classesRepository
      .createQueryBuilder('c')
      .innerJoin(SchoolYear, 's', 'c.school_year_id = s.id')
      .select('c.id', 'classId')
      .addSelect('c.name', 'className')
      .addSelect('s.name', 'schoolYear')
      .where('c.id =:classId', { classId })
      .getRawOne();

    const classStudents = await this.userClassRepository.count({
      where: { classId, teacherId: null },
    });

    const attendance = await this.gameRepository
      .createQueryBuilder('g')
      .innerJoin(Player, 'p', 'g.id = p.game_id')
      .innerJoin(Lesson, 'l', 'g.lesson_id = l.id')
      .select('g.id', 'gameId')
      .addSelect('l.name', 'lessonName')
      .addSelect('g.created_at', 'createdAt')
      .addSelect('COUNT(p.id)', 'playersJoined')
      .where('g.host_id =:teacherId', { teacherId })
      .andWhere('g.class_id =:classId', { classId })
      .groupBy('gameId')
      .orderBy('createdAt')
      .getRawMany();

    let totalAttendance = 0;
    const leaderboards = [];
    for (const a of attendance) {
      const att: {
        gameId: number;
        lessonName: string;
        createdAt: Date;
        playersJoined: string;
      } = a;
      totalAttendance += Number.parseInt(att.playersJoined);

      leaderboards.push(await this.getLeaderboard(att.gameId));
    }

    const games = await this.gameRepository.find({
      where: { classId, hostId: teacherId },
    });

    const gamesIds = [];
    for (const g of games) {
      gamesIds.push(g.id);
    }

    let totalScore = 0;
    let averageScore = 0;
    let totalGameTime = 0;
    for (const g of games) {
      const avg = await this.getGameAverageScore(g.id);
      averageScore += avg.averageScore;
      totalScore += avg.maxScore;
      const createdAt = g.createdAt ? g.createdAt.getTime() : 0;
      totalGameTime += g.endedAt.getTime() - createdAt;
    }

    const averageGameTime = this.convertTime(
      Math.floor(totalGameTime / games.length),
    );

    return {
      ...cl,
      totalStudents: classStudents,
      averageStudentsAttended: Math.floor(totalAttendance / attendance.length),
      totalScore: totalScore,
      averageScore: Math.floor(averageScore),
      totalGames: games.length,
      averageGameTime: averageGameTime,
    };
  }

  async getGameAttendance(gameId: number) {
    const leaderboard = await this.getLeaderboard(gameId);

    const players = await this.playerRepository.find({ where: { gameId } });
    const usersIds = [];
    for (const p of players) {
      usersIds.push(p.studentId);
    }

    const blacklist = await this.blacklistRepository.find({
      where: { gameId },
    });
    const blacklistIds = [];
    for (const b of blacklist) {
      blacklistIds.push(b.userId);
    }

    const absentStudents = await this.userClassRepository
      .createQueryBuilder('uc')
      .innerJoin(User, 'u', 'uc.student_id = u.id')
      .select('u.id', 'id')
      .addSelect('u.full_name', 'fullName')
      .where('u.id NOT IN(:usersIds)', { usersIds: usersIds.toString() })
      .getRawMany();

    const absent = [];
    for (const a of absentStudents) {
      absent.push(
        blacklistIds.indexOf(a.id) != -1
          ? { id: a.id, fullName: a.fullName, blacklist: true }
          : { id: a.id, fullName: a.fullName, blacklist: false },
      );
    }

    return {
      present: leaderboard,
      absent,
    };
  }
}
