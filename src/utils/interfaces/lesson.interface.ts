export interface ILesson {
  _id: string;
  name: string;
  content: string;
  points: number;
  due_date: string;
  links: string[];
  type: string;
  grade: number;
  lesson_plan_ids: string[];
}
