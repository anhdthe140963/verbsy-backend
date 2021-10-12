export class CreateQuestionDto {
  lectureId: number;

  question: string;

  answer: string;

  type: number;

  imageUrl: string;

  duration: number;
}
