import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { Repository } from 'typeorm';
import { LectureRepository } from '../lecture/repository/lecture.repository';
import { CreateQuestionDto } from './dto/question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Answer } from './entity/answer.entity';
import { Question } from './entity/question.entity';
import { QuestionRepository } from './repository/question.repository';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(QuestionRepository)
    private questionRepo: QuestionRepository,
    @InjectRepository(LectureRepository)
    private lectureRepo: LectureRepository,
    @InjectRepository(Answer)
    private answerRepo: Repository<Answer>,
  ) {}

  async createQuestion(
    createQuestionDto: CreateQuestionDto,
  ): Promise<Question> {
    const lecture = await this.lectureRepo.findOne(createQuestionDto.lectureId);
    //check if user exist
    if (!lecture) {
      throw new BadRequestException('Lecture not exist');
    }
    const question = new Question();
    question.answers = createQuestionDto.answers;
    question.duration = createQuestionDto.duration;
    question.imageUrl = createQuestionDto.imageUrl;
    question.lectureId = createQuestionDto.lectureId;
    question.question = createQuestionDto.question;
    return await question.save();
  }

  async getQuestionDetail(questionId: number): Promise<Question> {
    return await this.questionRepo.findOne({ id: questionId });
  }

  async updateQuestion(
    questionId: number,
    updateQuestionDto: UpdateQuestionDto,
  ): Promise<Question> {
    const { lectureId, question, imageUrl, answers, duration } =
      updateQuestionDto;
    const questionById = await this.questionRepo.findOne(questionId);
    //check if question by id exist
    if (!questionById) {
      throw new BadRequestException('Question not exist');
    }
    //check if lecture id need update
    if (lectureId) {
      const lecture = await this.lectureRepo.findOne(lectureId);
      //check if user exist
      if (!lecture) {
        throw new BadRequestException('Lecture not exist');
      }
      questionById.lectureId = lectureId;
    }
    //check if question need update
    if (question) {
      questionById.question = question;
    }
    //check if imageUrl need update
    if (imageUrl) {
      questionById.imageUrl = imageUrl;
    }
    //check if duration need update
    if (duration) {
      questionById.duration = duration;
    }
    //check if answers need update
    if (answers.length != 0) {
      await Promise.all(
        answers.map(async (answer) => {
          const anwserById = await this.answerRepo.findOne(answer.id);
          if (!anwserById) {
            throw new BadRequestException(
              `Answer with id ${answer.id} not exist`,
            );
          }
          anwserById.content = answer.content;
          anwserById.isCorrect = answer.isCorrect;
          anwserById.save();
        }),
      );
    }
    return questionById.save();
  }

  async getQuestionList(
    options: IPaginationOptions,
    lectureId: number,
  ): Promise<Pagination<Question>> {
    if (lectureId) {
      const lecture = await this.lectureRepo.findOne(lectureId);
      //check if user exist
      if (!lecture) {
        throw new BadRequestException('Lecture not exist');
      }
    }
    return paginate<Question>(this.questionRepo, options, {
      where: `lecture_id = ${lectureId}`,
    });
  }

  async delete(lectureId: number) {
    const data = await this.questionRepo.findOne({ id: lectureId });
    if (!data) {
      throw new BadRequestException('Question does not exist');
    }
    await this.questionRepo.delete({ id: lectureId });
  }

  async getAnswerList(questionId: number): Promise<Answer[]> {
    try {
      const question = await this.questionRepo.findOne(questionId);
      if (!question) {
        throw new BadRequestException('question does not exist');
      }
      return await this.answerRepo
        .createQueryBuilder()
        .where('questionId = :questionId', { questionId: questionId })
        .getMany();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
