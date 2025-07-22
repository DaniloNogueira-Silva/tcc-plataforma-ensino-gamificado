export interface IExerciseListAttempt {
  _id: string;
  user_progress_id: string;
  exercise_id: string;
  answer: string;
  grade?: number;
}
