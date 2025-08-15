export interface IUserProgressWithUser {
  _id: string;
  user_id: string;
  lesson_plan_id: string;
  external_id: string;
  type: string;
  points: number;
  answer?: string;
  final_grade?: number;
  items?: string[];
  coins?: number;
  file_path?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    _id: string;
    name: string;
    email: string;
    password: string;
    role: string;
    createdAt: string;
    updatedAt: string;
  };
}


export interface IUserProgress {
  _id: string;
  user_id: string;
  lesson_plan_id: string;
  external_id: string;
  type: string;
  points: number;
  answer?: string;
  final_grade?: number;
  items?: string[];
  coins?: number;
  file_path?: string;
  createdAt: string;
  updatedAt: string;
}
