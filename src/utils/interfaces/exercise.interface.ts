export interface IExercise {
  _id: string;
  statement: string;
  type: string;
  answer: string;
  showAnswer: boolean;
  due_date: Date;
  grade: number;
  points: number;
  lesson_plan_id: string;
  teacher_id: string;
  options?: any[];
}
