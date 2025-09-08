import { IExercise } from "./exercise.interface";

export interface IExerciseList {
  _id: string;
  name: string;
  content: string;
  teacher_id: string;
  exercises_ids: string[];
  difficulty?: "easy" | "medium" | "hard";
  type?: string;
  lesson_plan_ids?: string[];
  due_date?: string;
  points?: number;
  exercises?: IExercise[];

}
