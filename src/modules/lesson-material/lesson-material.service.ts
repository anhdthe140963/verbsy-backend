import { BadRequestException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Lesson } from '../curriculum/entities/lesson.entity';
import { CreateLessonMaterialDto } from './dto/create-lesson-material.dto';
import { LessonMaterialRepository } from './repository/lesson-material.repository';

@Injectable()
export class LessonMaterialService {
  constructor(
    private lessonMaterialRepository: LessonMaterialRepository,
    private lessonRepository: Repository<Lesson>,
  ) {}

  async isLessonExist(lessonId: number) {
    const lesson = await this.lessonRepository.findOne(lessonId);
    if (!lesson) {
      throw new BadRequestException('Lesson not exist');
    }
    return true;
  }

  async isMaterialExist(lessonId: number, url: string) {
    return await this.lessonMaterialRepository.findOne({
      where: { lessonId: lessonId, url: url },
    });
  }

  async createLessonMaterial(createLessonDto: CreateLessonMaterialDto) {
    const lessonMaterial = await this.lessonMaterialRepository.insert(
      createLessonDto,
    );
    return Object.assign(lessonMaterial.generatedMaps[0], createLessonDto);
  }

  async getMaterial(id: number) {
    const material = await this.lessonMaterialRepository.findOne(id);
    if (!material) {
      throw new BadRequestException('Lesson material not exist');
    }
    return material;
  }

  async getMaterialsByLessonId(lessonId: number) {
    return await this.lessonMaterialRepository.find({
      where: { lessonId: lessonId },
    });
  }

  async deleteLessonMaterial(id: number) {
    const deleted = await this.lessonMaterialRepository.delete({ id: id });
    if (deleted.affected == 0) {
      throw new BadRequestException('Lesson material not exist');
    }
    return deleted;
  }
}
