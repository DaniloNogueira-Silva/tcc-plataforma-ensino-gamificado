export interface IExercise {
  _id: string;
  statement: string;
  type: "open" | "multiple_choice" | "true_false";
  answer: string;
  showAnswer: boolean;
  due_date: string;
  grade: number;
  points: number;
  lesson_plan_id: string;
  teacher_id: string;
  options?: Options[];
}

export interface Options {
  statement: string;
  answer: boolean;
}