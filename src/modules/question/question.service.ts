import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateResult } from 'typeorm';
import { CreateQuestionDto } from './dto/question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Question } from './entity/question.entity';
import { QuestionRepository } from './repository/question.repository';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(QuestionRepository)
    private questionRepo: QuestionRepository,
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
}
