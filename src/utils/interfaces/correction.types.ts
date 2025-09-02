import { IExerciseListAttempt } from "@/utils/interfaces/exercise_list_attempt.interface";

export type StudentAnswer = {
  _id: string;
  user_id: { _id: string; name: string };
  final_grade?: number;
  points?: number;
  coins?: number;

  answer?: string;
  attempts?: IExerciseListAttempt[];
};

export interface ExerciseGradeMap {
  [exerciseId: string]: string;
}
