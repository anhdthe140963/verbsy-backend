export type LeaderboardDto = {
  questionId: number;
  leaderboard: {
    id: number;
    username: string;
    score: number;
    fullName: string;
  }[];
  answerStatistics: { id: number; content: string; isCorrect: boolean }[];
};
