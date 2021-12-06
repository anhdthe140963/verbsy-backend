import { BadRequestException, Injectable } from '@nestjs/common';
import { QuestionLevel } from 'src/constant/question-level.enum';
import { QuestionType } from 'src/constant/question-type.enum';
import { ScreenState } from 'src/constant/screen-state.enum';
import { shuffleArray } from 'src/utils/shuffle-array.util';
import { In, Like, Not } from 'typeorm';
import { BlacklistRepository } from '../blacklist/repository/blacklist.repository';
import { Classes } from '../classes/entity/classes.entity';
import { GameState } from '../game-state/entities/game-state.entity';
import { GameStateRepository } from '../game-state/repository/game-state.repository';
import { Game } from '../game/entities/game.entity';
import { GameRepository } from '../game/repositoty/game.repository';
import { Lecture } from '../lecture/entity/lecture.entity';
import { PlayerData } from '../player-data/entities/player-data.entity';
import { PlayerDataRepository } from '../player-data/repository/player-data.repository';
import { Player } from '../player/entities/player.entity';
import { PlayerRepository } from '../player/repository/player.repository';
import { QuestionRecord } from '../question-record/entities/question-record.entity';
import { QuestionRecordRepository } from '../question-record/repository/question-record.repository';
import { QuestionTypeConfigRepository } from '../question-type-config/repository/question-type-config.repository';
import { Answer } from '../question/entity/answer.entity';
import { Question } from '../question/entity/question.entity';
import { AnswerRepository } from '../question/repository/answer.repository';
import { QuestionRepository } from '../question/repository/question.repository';
import { UserClassRepository } from '../user-class/repository/question.repository';
import { User } from '../user/entity/user.entity';
import { UserRepository } from '../user/repository/user.repository';
import { GameStateDto } from './dto/game-state.dto';
import { HostGameDto } from './dto/host-game.dto';
import { NextQuestion } from './dto/next-question.dto';
import { SubmitAnswerDto } from './dto/submit-answer.dto';

@Injectable()
export class GameServerService {
  constructor(
    private readonly questionRepository: QuestionRepository,
    private readonly questionRecordRepository: QuestionRecordRepository,
    private readonly questionTypeConfigRepository: QuestionTypeConfigRepository,
    private readonly answerRepository: AnswerRepository,
    private readonly gameRepository: GameRepository,
    private readonly gameStateRepository: GameStateRepository,
    private readonly playerRepository: PlayerRepository,
    private readonly playerDataRepository: PlayerDataRepository,
    private readonly userRepository: UserRepository,
    private readonly userClassRepository: UserClassRepository,
    private readonly blacklistRepository: BlacklistRepository,
  ) {}

  calculateScore(
    answerTime: number,
    questionDuration: number,
    timeFactorWeight: number,
  ) {
    const baseScore = 100;
    const duration = questionDuration * 1000;
    const score = Math.floor(
      baseScore * (1 + (1 - answerTime / duration) * timeFactorWeight),
    );

    return score;
  }

  async getGameTimeFactorWeight(gameId: number): Promise<number> {
    const game = await this.gameRepository.findOne(gameId);
    return game.questionsConfig.timeFactorWeight;
  }

  async getUser(username: string): Promise<User> {
    return await this.userRepository.findOne({
      where: { username: username },
    });
  }

  async isHost(userId: number, gameId: number) {
    const game = await this.gameRepository.findOne(gameId);

    return userId == game.hostId;
  }

  async getQuestion(questionId: number) {
    const question = await this.questionRepository.findOne(questionId);
    question.answers.forEach((q) => {
      delete q.isCorrect;
    });
    return question;
  }

  async canJoinGame(studentId: number, gameId: number) {
    const game = await this.gameRepository.findOne(gameId);
    const classId = game.classId;

    const userClass = await this.userClassRepository.findOne({
      where: { studentId, classId },
    });

    return userClass ? true : false;
  }

  async getOngoingGames(hostId: number) {
    const ongoingGames = await this.gameRepository.find({
      where: { hostId, isGameLive: true },
    });

    const lecturesWithOngoingGamesIds = [];
    for (const ongoingGame of ongoingGames) {
      if (lecturesWithOngoingGamesIds.indexOf(ongoingGame.lectureId) <= -1) {
        lecturesWithOngoingGamesIds.push({
          gameId: ongoingGame.id,
          lectureId: ongoingGame.lectureId,
        });
      }
    }
    return lecturesWithOngoingGamesIds;
  }

  async getQuestionsForGame(gameId: number): Promise<Question[]> {
    const game = await this.gameRepository.findOne(gameId);
    const questions = await this.questionRepository.find({
      select: ['id', 'question', 'imageUrl', 'duration'],
      where: { lectureId: game.lectureId },
    });
    return questions;
  }

  async checkAnswer(answerId: number): Promise<boolean> {
    const answer = await this.answerRepository.findOne(answerId);
    return answer.isCorrect;
  }

  async getStudentsFromClass(classId: number): Promise<{
    students: { id: number; fullName: string; username: string }[];
    count: number;
  }> {
    const students = await this.userClassRepository
      .createQueryBuilder('uc')
      .innerJoin(User, 'u', 'uc.student_id = u.id')
      .select('u.id', 'id')
      .addSelect('u.full_name', 'fullName')
      .addSelect('u.username', 'username')
      .where('uc.class_id = :classId', { classId })
      .andWhere('uc.student_id IS NOT NULL')
      .orderBy('uc.id')
      .getRawMany();

    return { students: students, count: students.length + 1 };
  }

  async getGameStudentsList(
    classId: number,
    inGameStudents: User[],
  ): Promise<{
    students: {
      id: number;
      fullName: string;
      username: string;
      inGame: boolean;
    }[];
    inGame: number;
    total: number;
  }> {
    const inGameStudentsIds: number[] = [];
    const transformedInGameStudents: {
      id: number;
      fullName: string;
      username: string;
      inGame: boolean;
    }[] = [];
    for (const s of inGameStudents) {
      inGameStudentsIds.push(s.id);
      transformedInGameStudents.push({
        id: s.id,
        fullName: s.fullName,
        username: s.username,
        inGame: true,
      });
    }

    const notInGameStudents: {
      id: number;
      fullName: string;
      username: string;
    }[] = await this.userClassRepository
      .createQueryBuilder('uc')
      .innerJoin(User, 'u', 'uc.student_id = u.id')
      .select('u.id', 'id')
      .addSelect('u.full_name', 'fullName')
      .addSelect('u.username', 'username')
      .where('uc.class_id = :classId', { classId })
      .andWhere('uc.student_id IS NOT NULL')
      .andWhere('u.id NOT IN(:inGameStudentsIds)', {
        inGameStudentsIds: inGameStudentsIds.toString(),
      })
      .orderBy('uc.id')
      .getRawMany();

    const transformedNotInGameStudents: {
      id: number;
      fullName: string;
      username: string;
      inGame: boolean;
    }[] = [];
    for (const s of notInGameStudents) {
      transformedNotInGameStudents.push({
        id: s.id,
        fullName: s.fullName,
        username: s.username,
        inGame: false,
      });
    }

    const students = transformedInGameStudents.concat(
      transformedNotInGameStudents,
    );
    return {
      students: students,
      inGame: transformedInGameStudents.length,
      total: students.length,
    };
  }

  async submitAnswer(
    userId: number,
    submitAnswerDto: SubmitAnswerDto,
  ): Promise<PlayerData> {
    try {
      //Get Player for later record
      const player = await this.playerRepository.findOne({
        where: { studentId: userId, gameId: submitAnswerDto.gameId },
      });

      //Get Answer
      let answer: Answer;
      switch (submitAnswerDto.questionType) {
        case QuestionType.MultipleChoice:
          answer = await this.answerRepository.findOne(
            submitAnswerDto.answerId,
          );
          break;
        case QuestionType.Scramble:
        case QuestionType.Writting:
          answer = await this.answerRepository.findOne({
            where: { content: Like(submitAnswerDto.answer) },
          });
          break;
        default:
          throw new BadRequestException('Invalid questionType');
      }

      //Check Answer
      const isCorrect = answer ? answer.isCorrect : false;

      //Get question
      const question = await this.questionRepository.findOne(
        submitAnswerDto.questionId,
      );

      //Score Calculation
      const timeFactorWeight = await this.getGameTimeFactorWeight(
        submitAnswerDto.gameId,
      );
      const score = isCorrect
        ? this.calculateScore(
            submitAnswerDto.answerTime,
            question.duration,
            timeFactorWeight,
          )
        : 0;

      //Store player data
      const playerData = this.playerDataRepository.save({
        playerId: player.id,
        questionId: submitAnswerDto.questionId,
        question: question.question,
        answerId: submitAnswerDto.answerId,
        answer: submitAnswerDto.answer ?? answer.content,
        isCorrect: isCorrect,
        answerTime: submitAnswerDto.answerTime,
        score: score,
      });

      return playerData;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  //Handle when a question duration ran out
  //Should be optimized by using a single query instead
  async finishQuestion(
    gameId: number,
    questionId: number,
  ): Promise<QuestionRecord> {
    const playersInGame = await this.playerRepository.find({
      where: { gameId: gameId },
    });

    const playersIds = [];
    for (const player of playersInGame) {
      playersIds.push(player.id);
    }

    const answeredPlayers = await this.playerDataRepository.find({
      where: { playerId: In(playersIds), questionId: questionId },
    });

    const answeredPlayersIds = [];
    for (const player of answeredPlayers) {
      answeredPlayersIds.push(player.playerId);
    }

    const unansweredPlayers = await this.playerRepository.find({
      where: { id: Not(In(answeredPlayersIds)), gameId: gameId },
    });

    for (const player of unansweredPlayers) {
      await this.playerDataRepository.insert({
        playerId: player.id,
        questionId: questionId,
      });
    }

    //Record Question
    const questionTypeConfig = await this.questionTypeConfigRepository.findOne({
      where: { gameId: gameId, questionId: questionId },
    });

    const questionRecord = await this.questionRecordRepository.save({
      gameId: gameId,
      questionId: questionId,
      questionType: questionTypeConfig.questionType,
      answeredPlayers: answeredPlayersIds.length,
    });

    return questionRecord;
  }

  async getAnsweredPlayers(
    gameId: number,
    questionId: number,
  ): Promise<number> {
    const players = await this.playerRepository.find({ where: { gameId } });
    const playersIds = [];
    for (const player of players) {
      playersIds.push(player.id);
    }
    return await this.playerDataRepository.count({
      where: { questionId: questionId, playerId: In(playersIds) },
    });
  }

  async getAnswerStatistics(gameId: number, questionId: number) {
    const questionTypeConfig = await this.questionTypeConfigRepository.findOne({
      where: { gameId, questionId },
    });

    switch (questionTypeConfig.questionType) {
      case QuestionType.MultipleChoice:
        const questionRecord = await this.questionRecordRepository.findOne({
          where: { gameId, questionId },
        });

        if (questionRecord.answeredPlayers == 0) {
          return await this.answerRepository.find({
            where: { question: { id: questionId } },
          });
        }

        const statistics = await this.playerDataRepository
          .createQueryBuilder('pd')
          .leftJoin(Player, 'pl', 'pd.player_id = pl.id')
          .leftJoin(Answer, 'a', 'pd.answer_id = a.id')
          .select('a.id', 'id')
          .addSelect('a.content', 'content')
          .addSelect('a.is_correct', 'isCorrect')
          .addSelect('COUNT(pd.answerId)', 'count')
          .where('pl.game_id = :gameId', { gameId: gameId })
          .andWhere('pd.question_id = :questionId', { questionId: questionId })
          .groupBy('pd.answerId')
          .getRawMany();

        const appearedAnswersIds = [];
        for (const s of statistics) {
          appearedAnswersIds.push(s.id);
        }

        const answers = await this.answerRepository.find({
          where: {
            question: { id: questionId },
            id: Not(In(appearedAnswersIds)),
          },
        });

        for (const s of statistics) {
          s.isCorrect = new Boolean(s.isCorrect);
          s.count = parseInt(s.count);
        }

        const answerStats = answers.concat(statistics);
        answerStats.sort((a, b) => a.id - b.id);

        return answerStats;

      case QuestionType.Scramble:
      case QuestionType.Writting:
        const players = await this.playerRepository.find({ where: { gameId } });
        const playersIds = [];
        for (const player of players) {
          playersIds.push(player.id);
        }
        const correctPlayersCount = await this.playerDataRepository.count({
          where: {
            playerId: In(playersIds),
            questionId: questionId,
            isCorrect: true,
          },
        });
        const correctAnswers = await this.answerRepository.find({
          where: { question: { id: questionId }, isCorrect: true },
        });

        const correctAnswersContents: string[] = [];
        for (const correctAnswer of correctAnswers) {
          correctAnswersContents.push(correctAnswer.content);
        }

        return {
          correctAnswersContents,
          correctPlayersCount,
          incorrectPlayersCount: players.length - correctPlayersCount,
        };
    }
  }

  async getLeaderboard(gameId: number) {
    const records = await this.playerDataRepository
      .createQueryBuilder('pd')
      .leftJoinAndSelect(Player, 'pl', 'pd.player_id = pl.id')
      .leftJoinAndSelect(User, 'u', 'pl.student_id = u.id')
      .select('SUM(pd.score)', 'score')
      .addSelect('u.full_name', 'fullName')
      .addSelect('u.id', 'id')
      .addSelect('u.username', 'username')
      .where('pl.game_id = :gameId', { gameId: gameId })
      .groupBy('pd.player_id')
      .orderBy('score', 'DESC')
      .getRawMany();

    return records;
  }

  async endGame(gameId: number) {
    return await this.gameRepository.update(
      { id: gameId },
      { isGameLive: false, endedAt: new Date().toLocaleString() },
    );
  }

  async hostGame(hostId: number, hostGameDto: HostGameDto): Promise<Game> {
    const game = await this.gameRepository.save({
      hostId: hostId,
      classId: hostGameDto.classId,
      lectureId: hostGameDto.lectureId,
      questionsConfig: hostGameDto.questionsConfig,
      difficultyConfig: hostGameDto.difficultyConfig,
    });
    return game;
  }

  async getGameInfo(gameId: number): Promise<{
    id: number;
    lectureId: number;
    lectureName: string;
    classId: number;
    className: string;
  }> {
    const gameInfo = await this.gameRepository
      .createQueryBuilder('g')
      .leftJoin(Lecture, 'l', 'g.lecture_id = l.id')
      .leftJoin(Classes, 'cl', 'g.class_id = cl.id')
      .select('g.id', 'id')
      .addSelect('l.id', 'lectureId')
      .addSelect('l.name', 'lectureName')
      .addSelect('cl.id', 'classId')
      .addSelect('cl.name', 'className')
      .where('g.id = :gameId', { gameId: gameId })
      .getRawOne();

    return gameInfo;
  }

  async startGame(gameId: number, students: User[]) {
    for (const student of students) {
      await this.playerRepository.save({
        gameId: gameId,
        studentId: student.id,
      });
    }
  }

  //Blacklist
  async getBlacklist(
    gameId: number,
  ): Promise<{ id: number; fullName: string }[]> {
    return await this.blacklistRepository
      .createQueryBuilder('b')
      .leftJoin(User, 'u', 'b.user_id = u.id')
      .where('b.game_id = :gameId', { gameId: gameId })
      .select('u.id', 'id')
      .addSelect('u.full_name', 'fullName')
      .getRawMany();
  }

  async addToBlacklist(gameId: number, userId: number) {
    const bl = await this.blacklistRepository.findOne({
      where: { gameId: gameId, userId: userId },
    });

    if (bl) {
      return null;
    }
    return await this.blacklistRepository.save({
      gameId: gameId,
      userId: userId,
    });
  }

  async removeFromBlacklist(gameId: number, userId: number) {
    return await this.blacklistRepository.delete({
      gameId: gameId,
      userId: userId,
    });
  }

  //Should be optimized by using a single query instead
  async getNextQuestion(gameId: number): Promise<NextQuestion> {
    //Answered questions are questions that has been recorded in the current game
    const answeredQuestions = await this.questionRecordRepository.find({
      select: ['questionId'],
      where: { gameId: gameId },
    });

    const answeredQuestionsIds = [];
    for (const a of answeredQuestions) {
      answeredQuestionsIds.push(a.questionId);
    }

    //Remain questions are questions those aren't answered in the current game
    // const lectureId = (await this.gameRepository.findOne(gameId)).lectureId;
    const remainQuestions = await this.questionTypeConfigRepository.find({
      where: { questionId: Not(In(answeredQuestionsIds)), gameId },
    });

    //Next question is a random question in remain questions (if specfified)
    // const index = isRandom
    //   ? Math.floor(Math.random() * remainQuestions.length)
    //   : 0;

    const nextQuestionId = remainQuestions[0].questionId;
    const nextQuestion = await this.questionRepository.findOne(nextQuestionId);

    const questionTypeConfig = await this.questionTypeConfigRepository.findOne({
      where: { gameId, questionId: nextQuestion.id },
    });

    //Prepare data for frontend
    const next = new NextQuestion();
    next.questionType = questionTypeConfig.questionType;
    next.remainQuestions = remainQuestions.length - 1;
    next.totalQuestions = await this.questionTypeConfigRepository.count({
      where: { gameId },
    });

    switch (next.questionType) {
      case QuestionType.Scramble:
        delete nextQuestion.answers;
        next.nextQuestion = Object.assign(nextQuestion, {
          scrambled: await this.generateScrambleQuestion(nextQuestion),
        });
        break;
      default:
        //Multiple Choice
        next.nextQuestion = nextQuestion;
        for (const q of next.nextQuestion.answers) {
          delete q.isCorrect;
        }
    }
    return next;
  }

  private async generateScrambleQuestion(
    question: Question,
  ): Promise<string[]> {
    const correctAnswers = await this.answerRepository.find({
      where: { question: question, isCorrect: true },
    });
    const answerIndex = Math.floor(Math.random() * correctAnswers.length);
    const answerContent = correctAnswers[answerIndex].content.trim();

    const shuffledArray = answerContent.includes(' ')
      ? shuffleArray(answerContent.split(' '))
      : shuffleArray(answerContent.split(''));

    return shuffledArray;
  }

  async prepareQuestionType(gameId: number) {
    //Get game
    const game = await this.gameRepository.findOne(gameId);

    //Get questions pool
    const questions = await this.questionRepository.find({
      where: { lectureId: game.lectureId },
    });

    //Shuffle questions pool
    const shuffledQuestions: Question[] = questions;

    //Get questions config
    const questionsConfig = game.questionsConfig;

    //Number of questions needed
    const questionsCount = questionsConfig.questions;
    const difficultyConfig = game.difficultyConfig;

    //Array contains the questions pool of the game
    const gameQuestionsPool = [];

    //Number of questions of difficulties appear in game
    let easyQuestionsCount = difficultyConfig.easy;
    let mediumQuestionsCount = difficultyConfig.medium;
    let hardQuestionsCount = difficultyConfig.hard;

    //Fill gameQuestionPool array
    for (let i = 0; i < shuffledQuestions.length; i++) {
      switch (shuffledQuestions[i].level) {
        case QuestionLevel.Easy:
          if (easyQuestionsCount == 0) break;
          gameQuestionsPool.push(shuffledQuestions[i]);
          easyQuestionsCount--;
          break;
        case QuestionLevel.Medium:
          if (mediumQuestionsCount == 0) break;
          gameQuestionsPool.push(shuffledQuestions[i]);
          mediumQuestionsCount--;
          break;
        case QuestionLevel.Hard:
          if (hardQuestionsCount == 0) break;
          gameQuestionsPool.push(shuffledQuestions[i]);
          hardQuestionsCount--;
          break;
      }

      if (gameQuestionsPool.length == questionsCount) {
        break;
      }
    }

    //Question types pool
    const questionTypesOriginal = questionsConfig.questionTypes ?? [
      QuestionType.MultipleChoice,
    ];

    //Set question type
    for (const question of gameQuestionsPool) {
      const questionTypesPool = questionTypesOriginal.slice();

      //Check if eligible for scramble
      // const answers = question.answers;

      // if (questionTypesPool.includes(QuestionType.Scramble)) {
      //   for (const answer of answers) {
      //     if (answer.isCorrect) {
      //       if (
      //         answer.content.trim().includes(' ') ||
      //         answer.content.length <= 1
      //       ) {
      //         //Remove Scramble if ineligible
      //         const index = questionTypesPool.indexOf(QuestionType.Scramble);
      //         if (index != -1) {
      //           questionTypesPool.splice(index, 1);
      //           continue;
      //         }
      //       }
      //     }
      //   }
      // }

      const questionTypeIndex: number = Math.floor(
        Math.random() * questionTypesPool.length,
      );

      const questionType = questionTypesPool[questionTypeIndex];

      await this.questionTypeConfigRepository.save({
        gameId: gameId,
        questionId: question.id,
        questionType: questionType,
      });
    }
  }

  async saveGameState(gameState: GameStateDto) {
    const existGameState = await this.gameStateRepository.findOne({
      where: { gameId: gameState.gameId },
    });

    if (!existGameState) {
      return await this.gameStateRepository.insert(gameState);
    } else {
      return await this.gameStateRepository.update(
        existGameState.id,
        gameState,
      );
    }
  }

  async recoverGameState(gameId: number, userId: number) {
    const game = await this.gameRepository.findOne(gameId);
    const isHost = game.hostId == userId;

    const gameState = await this.gameStateRepository.findOne({
      where: { gameId },
    });

    if (!gameState) {
      return null;
    }

    const nextQuestion: NextQuestion = await this.getNextQuestion(gameId);
    const currentQuestion = await this.questionRepository.findOne(
      gameState.currentQuestionId,
    );

    let playerData: PlayerData = null;
    if (!isHost) {
      const player = await this.playerRepository.findOne({
        where: { gameId, studentId: userId },
      });

      playerData = await this.playerDataRepository.findOne({
        where: {
          playerId: player.id,
          questionId: gameState.currentQuestionId,
        },
      });
    }

    let recoveredGameStateData = {};
    switch (gameState.screenState) {
      case ScreenState.Lobby:
        break;
      case ScreenState.Question:
        recoveredGameStateData = {
          question: nextQuestion,
          timeLeft: gameState.timeLeft,
        };
        break;
      case ScreenState.Statistic:
        const questionTypeConfig =
          await this.questionTypeConfigRepository.findOne({
            where: { gameId, questionId: currentQuestion.id },
          });

        const answerStatistics = await this.getAnswerStatistics(
          gameId,
          gameState.currentQuestionId,
        );
        recoveredGameStateData = {
          question: {
            question: currentQuestion.question,
            questionType: questionTypeConfig.questionType,
            remainQuestions: nextQuestion.remainQuestions + 1,
            totalQuestions: nextQuestion.totalQuestions,
          },
          answerStatistics,
        };
        break;
      case ScreenState.Leaderboard:
        const leaderboard = await this.getLeaderboard(gameId);
        recoveredGameStateData = {
          leaderboard,
          remainQuestions: nextQuestion.remainQuestions,
          totalQuestions: nextQuestion.totalQuestions,
        };
        break;
    }

    if (!isHost) {
      recoveredGameStateData = {
        playerData,
        recoveredGameStateData,
      };
    }

    if (isHost) {
      const studentsStatistics = await this.getStudentsStatistics(gameId);
      recoveredGameStateData = {
        recoveredGameStateData,
        studentsStatistics,
      };
    }

    return { gameState, ...recoveredGameStateData };
  }

  async getGameState(gameId: number): Promise<GameState> {
    return await this.gameStateRepository.findOne({
      where: { gameId },
    });
  }

  async isReconnect(gameId: number, studentId: number) {
    return await this.playerRepository.findOne({
      where: { gameId, studentId },
    });
  }

  async getStudentsStatistics(gameId: number) {
    try {
      const players = await this.playerRepository.find({ where: { gameId } });

      const playersStats: {
        id: number;
        username: string;
        fullName: string;
        totalScore: number;
        stats: PlayerData[];
      }[] = [];
      for (const player of players) {
        const user = await this.userRepository.findOne(player.studentId);
        const totalScore = await this.playerDataRepository
          .createQueryBuilder('pd')
          .select('SUM(pd.score)', 'totalScore')
          .where('pd.player_id = :playerId', { playerId: player.id })
          .groupBy('pd.player_id')
          .getRawOne();
        const playerStats = await this.playerDataRepository.find({
          select: ['id', 'questionId', 'isCorrect'],
          where: { playerId: player.id },
          order: { questionId: 'ASC' },
        });
        playersStats.push({
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          ...{
            totalScore: totalScore ? parseInt(totalScore.totalScore) : 0,
          },
          ...{ stats: playerStats },
        });
      }
      playersStats.sort((a, b) => b.totalScore - a.totalScore);
      return playersStats;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
