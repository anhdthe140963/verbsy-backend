import { Injectable } from '@nestjs/common';
import { QuestionType } from 'src/constant/question-type.enum';
import { shuffleArray } from 'src/utils/shuffle-array.util';
import { In, Like, Not } from 'typeorm';
import { BlacklistRepository } from '../blacklist/repository/blacklist.repository';
import { Game } from '../game/entities/game.entity';
import { GameRepository } from '../game/repositoty/game.repository';
import { PlayerData } from '../player-data/entities/player-data.entity';
import { PlayerDataRepository } from '../player-data/repository/player-data.repository';
import { Player } from '../player/entities/player.entity';
import { PlayerRepository } from '../player/repository/player.repository';
import { QuestionRecord } from '../question-record/entities/question-record.entity';
import { QuestionRecordRepository } from '../question-record/repository/question-record.repository';
import { Answer } from '../question/entity/answer.entity';
import { Question } from '../question/entity/question.entity';
import { AnswerRepository } from '../question/repository/answer.repository';
import { QuestionRepository } from '../question/repository/question.repository';
import { User } from '../user/entity/user.entity';
import { UserRepository } from '../user/repository/user.repository';
import { NextQuestion } from './dto/next-question.dto';
import { SubmitAnswerDto } from './dto/submit-answer.dto';

@Injectable()
export class GameServerService {
  constructor(
    private readonly questionRepository: QuestionRepository,
    private readonly questionRecordRepository: QuestionRecordRepository,
    private readonly answerRepository: AnswerRepository,
    private readonly gameRepository: GameRepository,
    private readonly playerRepository: PlayerRepository,
    private readonly playerDataRepository: PlayerDataRepository,
    private readonly userRepository: UserRepository,
    private readonly blacklistRepository: BlacklistRepository,
  ) {}

  async getUser(username: string): Promise<User> {
    return await this.userRepository.findOne({
      where: { username: username },
    });
  }

  async getQuestion(questionId: number) {
    const question = await this.questionRepository.findOne(questionId);
    question.answers.forEach((q) => {
      delete q.isCorrect;
    });
    return question;
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
        case QuestionType.Scramble || QuestionType.Writting:
          answer = await this.answerRepository.findOne({
            where: { content: Like(submitAnswerDto.answer) },
          });
          break;
        default:
          //Multiple Choice
          answer = await this.answerRepository.findOne(
            submitAnswerDto.answerId,
          );
      }

      //Check Answer
      const isCorrect = answer ? answer.isCorrect : false;

      //Record Question
      let questionRecord = await this.questionRecordRepository.findOne({
        where: {
          gameId: submitAnswerDto.gameId,
          questionId: submitAnswerDto.questionId,
        },
      });
      if (!questionRecord) {
        questionRecord = await this.questionRecordRepository.save({
          gameId: submitAnswerDto.gameId,
          questionId: submitAnswerDto.questionId,
          questionType: submitAnswerDto.questionType,
          answeredPlayers: 1,
        });
      } else {
        const questionRecordId = questionRecord.id;
        const answeredPlayers = questionRecord.answeredPlayers + 1;
        questionRecord = await this.questionRecordRepository.save({
          id: questionRecordId,
          answeredPlayers: answeredPlayers,
        });
      }

      //Get question
      const question = await this.questionRepository.findOne(
        questionRecord.questionId,
      );

      //Score Calculation
      const score = isCorrect
        ? question.duration * 1000 - submitAnswerDto.answerTime
        : 0;

      //Store player data
      return await this.playerDataRepository.save({
        playerId: player.id,
        questionId: submitAnswerDto.questionId,
        answerId: answer ? answer.id : null,
        answer: submitAnswerDto.answer ?? null,
        isCorrect: isCorrect,
        answerTime: submitAnswerDto.answerTime,
        score: score,
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  //Handle when a question duration ran out
  //Should be optimized by using a single query instead
  async finishQuestion(gameId: number, questionId: number): Promise<void> {
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
  }

  async getAnsweredPlayers(
    gameId: number,
    questionId: number,
  ): Promise<QuestionRecord> {
    return await this.questionRecordRepository.findOne({
      where: { gameId, questionId },
    });
  }

  async getAnswerStatistics(gameId: number, questionId: number) {
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
      console.log(s);
      appearedAnswersIds.push(s.id);
    }

    const answers = await this.answerRepository.find({
      where: { question: { id: questionId }, id: Not(In(appearedAnswersIds)) },
    });

    for (const s of statistics) {
      s.isCorrect = new Boolean(s.isCorrect);
      s.count = parseInt(s.count);
    }

    return answers.concat(statistics);
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
  ): Promise<Game> {
    return await this.gameRepository.save({
      lectureId: lectureId,
      classId: classId,
      hostId: hostId,
      isGameLive: true,
    });
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
  async getBlacklist(gameId: number) {
    return await this.blacklistRepository.find({ gameId: gameId });
  }

  async addToBlacklist(gameId: number, userId: number) {
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
  async getNextQuestion(
    gameId: number,
    isRandom = false,
    questionType: QuestionType = QuestionType.MultipleChoice,
  ): Promise<NextQuestion> {
    //Answered questions are questions that has been recorded in the current game
    const answeredQuestions = await this.questionRecordRepository.find({
      select: ['questionId'],
      where: { gameId: gameId },
    });

    const answered = [];
    for (const a of answeredQuestions) {
      answered.push(a.questionId);
    }

    //Remain questions are questions those aren't answered in the current game
    const lectureId = (await this.gameRepository.findOne(gameId)).lectureId;
    const remainQuestions = await this.questionRepository.find({
      where: { id: Not(In(answered)), lectureId: lectureId },
    });

    //Next question is a random question in remain questions (if specfified)
    const index = isRandom
      ? Math.floor(Math.random() * remainQuestions.length)
      : 0;

    const nextQuestion = remainQuestions[index];

    //Prepare data for frontend
    const next = new NextQuestion();
    next.questionType = questionType;
    next.remainQuestions = remainQuestions.length - 1;

    switch (questionType) {
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
}
