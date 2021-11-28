import { IsNumber } from 'class-validator';

export class ChangeStudentsClass {
  @IsNumber({}, { each: true })
  studentIds: number[];
  @IsNumber()
  newClassId: number;
  @IsNumber()
  oldClassId: number;
}
