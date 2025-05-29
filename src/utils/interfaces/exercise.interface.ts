export interface IExercise {
  _id: string;
  statement: string;
  type: "open" | "multiple_choice" | "true_false";
  answer: string;
  showAnswer: boolean;
  due_date: string;
  grade: number;
  points: number;
  teacher_id: string;
  multiple_choice_options?: string[];
  true_false_options?: Options[];
  lesson_plan_ids?: string[];
}

export interface Options {
  statement: string;
  answer: boolean;
}
