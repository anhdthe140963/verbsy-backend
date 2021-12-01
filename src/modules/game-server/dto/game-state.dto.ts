import { ScreenState } from 'src/constant/screen-state.enum';

export class GameStateDto {
  gameId: number;
  currentQuestionId: number;
  screenState: ScreenState;
  timeLeft: number;
}
