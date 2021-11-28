import { PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { CreateLectureDto } from './create-lecture.dto';

export class UpdateLectureDto extends PartialType(CreateLectureDto) {
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  name: string;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  content: string;

  @IsNotEmpty()
  @IsNumber()
  @IsOptional()
  ownerId: number;
}
