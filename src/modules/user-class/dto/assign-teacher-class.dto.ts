import { IsNumber } from 'class-validator';

export class AssignTeachersClassDto {
  @IsNumber({}, { each: true })
  teacherIds: number[];
  @IsNumber()
  classId: number;
}
