import { IsNumber } from 'class-validator';

export class AssignClassToTeacherDto {
  @IsNumber({}, { each: true })
  classIds: number[];
  @IsNumber()
  teacherId: number;
}
