import { IsInt, IsNotEmpty } from 'class-validator';

export class HostGameDto {
  @IsNotEmpty()
  @IsInt()
  lectureId: number;

  @IsNotEmpty()
  @IsInt()
  hostId: number;

  @IsNotEmpty()
  @IsInt()
  classId: number;
}
