export interface ILessonPlanByRole {
  lessonplan: {
    name: string;
    icon?: string;
    _id: string;
  };
  progress: number;
  teacher: {
    name: string;
  };
}

export interface ILessonPlan {
  name: string;
  _id: string;
  teacher_id: string;
  icon?: string;
}
