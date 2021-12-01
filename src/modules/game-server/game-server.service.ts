import { BadRequestException, Injectable } from '@nestjs/common';
import { QuestionType } from 'src/constant/question-type.enum';
import { ScreenState } from 'src/constant/screen-state.enum';
import { shuffleArray } from 'src/utils/shuffle-array.util';
import { In, Like, Not, Unique } from 'typeorm';
import { BlacklistRepository } from '../blacklist/repository/blacklist.repository';
import { Classes } from '../classes/entity/classes.entity';
import { GameState } from '../game-state/entities/game-state.entity';
import { GameStateRepository } from '../game-state/repository/game-state.repository';
import { Game } from '../game/entities/game.entity';
import { GameRepository } from '../game/repositoty/game.repository';
import { Lecture } from '../lecture/entity/lecture.entity';
import { LectureRepository } from '../lecture/repository/lecture.repository';
import { LessonLectureRepository } from '../lesson-lecture/repository/lesson-lecture.repository';
import { LessonRepository } from '../lesson/repository/lesson.repository';
import { PlayerData } from '../player-data/entities/player-data.entity';
import { PlayerDataRepository } from '../player-data/repository/player-data.repository';
import { Player } from '../player/entities/player.entity';
import { PlayerRepository } from '../player/repository/player.repository';
import { QuestionRecord } from '../question-record/entities/question-record.entity';
import { QuestionRecordRepository } from '../question-record/repository/question-record.repository';
import { QuestionTypeConfig } from '../question-type-config/entities/question-type-config.entity';
import { QuestionTypeConfigRepository } from '../question-type-config/repository/question-type-config.repository';
import { Answer } from '../question/entity/answer.entity';
import { Question } from '../question/entity/question.entity';
import { AnswerRepository } from '../question/repository/answer.repository';
import { QuestionRepository } from '../question/repository/question.repository';
import { UserClassRepository } from '../user-class/repository/question.repository';
import { User } from '../user/entity/user.entity';
import { UserRepository } from '../user/repository/user.repository';
import { GameStateDto } from './dto/game-state.dto';
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
    private readonly lectureRepository: LectureRepository,
    private readonly lessonLectureRepository: LessonLectureRepository,
    private readonly lessonRepository: LessonRepository,
  ) {}

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
      const score = isCorrect
        ? (question.duration * 1000 - submitAnswerDto.answerTime) / 100
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
      const playerData = await this.playerDataRepository.save({
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

        return answers.concat(statistics);

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

  async hostGame(
    lectureId: number,
    classId: number,
    hostId: number,
    questionTypes: QuestionType[],
  ): Promise<Game> {
    const game = await this.gameRepository.save({
      lectureId: lectureId,
      classId: classId,
      hostId: hostId,
      isGameLive: true,
      questionsConfig: { shuffle: false, questionTypes },
    });
    // const lecture = await this.lectureRepository.findOne(lectureId);
    // if (lecture) {
    //   Object.assign(game, { lectureName: lecture.name });
    // }
    // const questions = await this.questionRepository.find({
    //   lectureId: lectureId,
    // });
    // if (questions) {
    //   Object.assign(game, { totalQuestion: questions.length });
    // }
    // const lessonLecture = await this.lessonLectureRepository.findOne({
    //   lectureId: lectureId,
    // });
    // const lesson = await this.lessonRepository.findOne(lessonLecture.lessonId);
    // if (lesson) {
    //   Object.assign(game, { lessonName: lesson.name });
    // }
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
    const lectureId = (await this.gameRepository.findOne(gameId)).lectureId;
    const remainQuestions = await this.questionRepository.find({
      where: { id: Not(In(answeredQuestionsIds)), lectureId: lectureId },
    });

    //Next question is a random question in remain questions (if specfified)
    // const index = isRandom
    //   ? Math.floor(Math.random() * remainQuestions.length)
    //   : 0;

    const nextQuestion = remainQuestions[0];

    const questionTypeConfig = await this.questionTypeConfigRepository.findOne({
      where: { gameId, questionId: nextQuestion.id },
    });

    //Prepare data for frontend
    const next = new NextQuestion();
    next.questionType = questionTypeConfig.questionType;
    next.remainQuestions = remainQuestions.length - 1;
    next.totalQuestions = await this.questionRepository.count({
      where: { lectureId: lectureId },
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

    //Get questions from lecture
    const questions = await this.questionRepository.find({
      where: { lectureId: game.lectureId },
    });

    const questionTypesOriginal = game.questionsConfig.questionTypes ?? [
      QuestionType.MultipleChoice,
    ];

    //Set question type
    for (const question of questions) {
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
      return await this.gameStateRepository.save(gameState);
    } else {
      return await this.gameStateRepository.save({
        id: existGameState.id,
        gameState,
      });
    }
  }

  async recoverGameState(gameId: number, isHost: boolean) {
    const gameState = await this.gameStateRepository.findOne({
      where: { gameId },
    });

    let recoveredGameStateData = {};
    switch (gameState.screenState) {
      case ScreenState.Lobby:
        break;
      case ScreenState.Question:
        const question: NextQuestion = await this.getNextQuestion(gameId);
        recoveredGameStateData = { question, timeLeft: gameState.timeLeft };
        break;
      case ScreenState.Statistic:
        const answerStatistics = await this.getAnswerStatistics(
          gameId,
          gameState.currentQuestionId,
        );
        recoveredGameStateData = { answerStatistics };
        break;
      case ScreenState.Leaderboard:
        const leaderboard = await this.getLeaderboard(gameId);
        recoveredGameStateData = { leaderboard };
        break;
    }

    if (isHost) {
      const studentsStatistics = await this.getStudentsStatistics(gameId);
      recoveredGameStateData = { ...studentsStatistics };
    }

    return recoveredGameStateData;
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
        ...{ totalScore: parseInt(totalScore.totalScore) },
        ...{ stats: playerStats },
      });
    }
    playersStats.sort((a, b) => b.totalScore - a.totalScore);
    return playersStats;
  }
}
