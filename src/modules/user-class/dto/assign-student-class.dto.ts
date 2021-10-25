import { IsNumber } from 'class-validator';

export class AssignStudentsClassDto {
  @IsNumber({}, { each: true })
  studentIds: number[];
  @IsNumber()
  classId: number;
}
