import { PartialType } from '@nestjs/swagger';
import { CreateLessonMaterialDto } from './create-lesson-material.dto';

export class UpdateLessonMaterialDto extends PartialType(CreateLessonMaterialDto) {}
