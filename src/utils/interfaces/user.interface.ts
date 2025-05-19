export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  password: string;
}

export interface IUserStats {
  user: IUser;
  lesson_plans_length: number;
  exercises_length: number;
  lessons_length: number;
  level: number;
  points: number;
  trophies: ITrophy[];
}

export interface ITrophy {
  _id: string;
  name: string;
  description: string;
  conditions: {
    type: string;
    value: number;
  };
}
