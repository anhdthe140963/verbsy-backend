import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { UpdateResult } from 'typeorm';
import { LectureRepository } from '../lecture/repository/lecture.repository';
import { CreateQuestionDto } from './dto/question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Question } from './entity/question.entity';
import { QuestionRepository } from './repository/question.repository';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(QuestionRepository)
    private questionRepo: QuestionRepository,
    @InjectRepository(LectureRepository)
    private lectureRepo: LectureRepository,
  ) {}

  async createQuestion(
    createQuestionDto: CreateQuestionDto,
  ): Promise<Question> {
    const question = new Question();
    question.lectureId = createQuestionDto.lectureId;
    question.question = createQuestionDto.question;
    question.answer = createQuestionDto.answer;
    question.type = createQuestionDto.type;
    question.duration = createQuestionDto.duration;
    question.imageUrl = createQuestionDto.imageUrl;
    return await question.save();
  }

  async getQuestionDetail(questionId: number): Promise<Question> {
    return await this.questionRepo.findOne({ id: questionId });
  }

  async updateQuestion(
    questionId: number,
    updateQuestionDto: UpdateQuestionDto,
  ): Promise<UpdateResult> {
    return await this.questionRepo.update(questionId, updateQuestionDto);
  }

  async getQuestionList(
    options: IPaginationOptions,
    lectureId: number,
  ): Promise<Pagination<Question>> {
    const query = this.questionRepo.createQueryBuilder().orderBy('id', 'ASC');

    if (lectureId) {
      const user = await this.lectureRepo.findOne(lectureId);
      //check if user exist
      if (!user) {
        throw new BadRequestException('Lecture not exist');
      }
      query.where('lecture_id = :lectureId', { lectureId: lectureId });
    }
    return paginate<Question>(query, options);
  }

  async delete(lectureId: number) {
    const data = await this.questionRepo.findOne({ id: lectureId });
    if (!data) {
      throw new BadRequestException('Question does not exist');
    }
    await this.questionRepo.delete({ id: lectureId });
  }
}
