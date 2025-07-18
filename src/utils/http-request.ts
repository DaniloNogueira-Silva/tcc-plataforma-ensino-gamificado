import { IExercise, Options } from "./interfaces/exercise.interface";
import {
  ILessonPlan,
  ILessonPlanByRole,
} from "./interfaces/lesson-plan.interface";
import { IExerciseList } from "./interfaces/exercise_list.interface";
import { IAvatar } from "./interfaces/avatar.interface";
import { ILesson } from "./interfaces/lesson.interface";
import { IUser } from "./interfaces/user.interface";
import { TokenPayload } from "@/app/(admin)/(home)/exercise/form/page";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { IRanking } from "./interfaces/ranking.interface";

export class HttpRequest {
  async getToken(): Promise<string | undefined> {
    const token = localStorage.getItem("token");
    if (token) {
      return token;
    }

    return undefined;
  }

  async login(email: string, password: string): Promise<string> {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`,
      {
        email,
        password,
      }
    );

    localStorage.setItem("token", response.data.access_token);

    return response.data;
  }

  async createUser(
    email: string,
    password: string,
    name: string,
    role: string
  ): Promise<void> {
    try {
      return await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users`, {
        name,
        email,
        password,
        role,
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async getUserByRole(): Promise<IUser> {
    try {
      const token = await this.getToken();

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/users`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getLessonPlansByRole(): Promise<ILessonPlanByRole[] | []> {
    const token = await this.getToken();

    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/lesson-plans`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  }

  async createLessonPlan(
    name: string,
    icon: string
  ): Promise<ILessonPlan | null> {
    try {
      const token = await this.getToken();
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/lesson-plans`,
        {
          name,
          icon,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Erro ao criar o plano de aula:", error);
      throw error;
    }
  }

  async updateLessonPlan(
    id: string,
    name?: string,
    icon?: string
  ): Promise<ILessonPlan | null> {
    try {
      const token = await this.getToken();
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/lesson-plans/${id}`,
        {
          name,
          icon,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar o plano de aula:", error);
      throw error;
    }
  }

  async removeLessonPlan(id: string): Promise<ILessonPlan | null> {
    try {
      const token = await this.getToken();
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/lesson-plans/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Erro ao deletar o plano de aula:", error);
      throw error;
    }
  }

  async createLesson(
    name: string,
    due_date: string,
    content: string,
    links: string,
    points: number,
    type: string,
    grade: number,
    teacher_id: string,
    lesson_plan_ids?: string[]
  ): Promise<ILesson | null> {
    try {
      const token = await this.getToken();

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/lessons`,
        {
          name,
          due_date,
          content,
          links,
          points,
          type,
          grade,
          teacher_id,
          lesson_plan_ids,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Erro ao criar aula:", error);
      throw new Error("Ocorreu um erro ao criar a aula: " + error);
    }
  }

  async getAllLessons() {
    try {
      const token = await this.getToken();

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/lessons`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Erro ao buscar usuário por id:", error);
      throw error;
    }
  }

  async getLessonById(id: string) {
    try {
      const token = await this.getToken();

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/lessons/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Erro ao buscar aula:", error);
      throw new Error("Ocorreu um erro ao buscar aula: " + error);
    }
  }

  async getAllLessonsByLessonPlanId(lessonPlanId: string) {
    try {
      const token = await this.getToken();

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/lessons/${lessonPlanId}/byLessonPlan`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Erro ao buscar exercícios:", error);
      throw new Error("Ocorreu um erro ao buscar exercícios: " + error);
    }
  }

  async updateLesson(
    id: string,
    name?: string,
    due_date?: string,
    content?: string,
    links?: string,
    points?: number,
    type?: string,
    grade?: number,
    lesson_plan_ids?: string[]
  ): Promise<ILesson | null> {
    try {
      const token = await this.getToken();

      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/lessons/${id}`,
        {
          name,
          due_date,
          content,
          links,
          points,
          type,
          grade,
          lesson_plan_ids,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Erro ao criar aula:", error);
      throw new Error("Ocorreu um erro ao criar a aula: " + error);
    }
  }

  async updateLessonAndLessonPlans(
    id: string,
    name?: string,
    due_date?: string,
    content?: string,
    links?: string,
    points?: number,
    type?: string,
    grade?: number,
    lesson_plan_ids?: string[]
  ): Promise<IExercise | null> {
    try {
      const token = await this.getToken();

      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/lessons/${id}`,
        {
          name,
          due_date,
          content,
          links,
          points,
          type,
          grade,
          lesson_plan_ids,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar aula:", error);
      throw new Error("Ocorreu um erro ao atualizar aula: " + error);
    }
  }

  async removeLesson(id: string) {
    try {
      const token = await this.getToken();

      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/lessons/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return;
    } catch (error) {
      console.error("Erro ao deletar aula:", error);
      throw new Error("Ocorreu um erro ao deletar aula: " + error);
    }
  }

  async getAllExercises() {
    try {
      const token = await this.getToken();

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/exercises`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Erro ao buscar exercícios:", error);
      throw new Error("Ocorreu um erro ao buscar exercícios: " + error);
    }
  }

  async getAllExerciseByLessonPlanId(lessonPlanId: string) {
    try {
      const token = await this.getToken();

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/exercises/${lessonPlanId}/byLessonPlan`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Erro ao buscar exercícios:", error);
      throw new Error("Ocorreu um erro ao buscar exercícios: " + error);
    }
  }

  async getExerciseById(id: string) {
    try {
      const token = await this.getToken();

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/exercises/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Erro ao buscar exercício:", error);
      throw new Error("Ocorreu um erro ao buscar exercício: " + error);
    }
  }

  async createExercise(
    statement: string,
    type: string,
    answer: string,
    showAnswer: boolean,
    teacher_id: string,
    multiple_choice_options?: string[],
    true_false_options?: Options[],
    lesson_plan_ids?: string[],
    due_date?: string,
    points?: number,
    grade?: number
  ): Promise<IExercise | null> {
    try {
      const token = await this.getToken();

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/exercises`,
        {
          statement,
          type,
          answer,
          showAnswer,
          teacher_id,
          due_date,
          points,
          grade,
          multiple_choice_options,
          true_false_options,
          lesson_plan_ids,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Erro ao criar exercício:", error);
      throw new Error("Ocorreu um erro ao criar exercício: " + error);
    }
  }

  async updateExerciseAndLessonPlans(
    id: string,
    statement?: string,
    type?: string,
    finalAnswer?: string,
    showAnswer?: boolean,
    multiple_choice_options?: string[],
    true_false_options?: Options[],
    lesson_plan_ids?: string[],
    due_date?: string,
    points?: number,
    grade?: number
  ): Promise<IExercise | null> {
    try {
      const token = await this.getToken();

      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/exercises/${id}`,
        {
          statement,
          type,
          answer: finalAnswer,
          showAnswer,
          due_date,
          points,
          grade,
          multiple_choice_options,
          true_false_options,
          lesson_plan_ids,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Erro ao criar exercício:", error);
      throw new Error("Ocorreu um erro ao criar exercício: " + error);
    }
  }

  async removeExercise(id: string) {
    try {
      const token = await this.getToken();

      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/exercises/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return;
    } catch (error) {
      console.error("Erro ao deletar exercício:", error);
      throw new Error("Ocorreu um erro ao deletar exercício: " + error);
    }
  }

  async submitAnswer(exerciseId: string, answer: string) {
    try {
      const token = await this.getToken();

      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/exercises/${exerciseId}/submitAnswer`,
        { answer },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return;
    } catch (error) {
      console.error(
        "Erro ao coletar resposta do exercício de multipla escolha:",
        error
      );
      throw new Error(
        "Ocorreu um erro ao coletar resposta do exercício de multipla escolha: " +
          error
      );
    }
  }

  async teacherCorretion(
    exercise_id: string,
    user_id: string,
    final_grade: number,
    points: number
  ): Promise<any> {
    try {
      const token = await this.getToken();

      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/exercises/${exercise_id}/teacher-correction`,
        {
          user_id,
          final_grade,
          points,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar nota do aluno no exercício:", error);
      throw new Error(
        "Ocorreu um erro ao atualizar nota do aluno no exercício: " + error
      );
    }
  }

  async createExerciseList(
    name: string,
    content: string,
    teacher_id: string,
    exercises_ids: string[],
    lesson_plan_ids?: string[],
    type?: string,
    due_date?: string,
    points?: number
  ): Promise<IExerciseList | null> {
    try {
      const token = await this.getToken();

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/exercise_lists`,
        {
          name,
          content,
          type,
          teacher_id,
          due_date,
          points,
          exercises_ids,
          lesson_plan_ids,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Erro ao criar uma lista de exercício:", error);
      throw new Error(
        "Ocorreu um erro ao criar uma lista de exercício: " + error
      );
    }
  }

  async getAllExerciseLists() {
    try {
      const token = await this.getToken();

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/exercise_lists`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Erro ao buscar listas de exercício:", error);
      throw new Error(
        "Ocorreu um erro ao buscar listas de exercício: " + error
      );
    }
  }

  async getAllExerciseListByLessonPlanId(lessonPlanId: string) {
    try {
      const token = await this.getToken();

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/exercise_lists/${lessonPlanId}/byLessonPlan`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Erro ao buscar uma lista de exercício:", error);
      throw new Error(
        "Ocorreu um erro ao buscar uma lista de exercício: " + error
      );
    }
  }

  async getExerciseListById(id: string) {
    try {
      const token = await this.getToken();

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/exercise_lists/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Erro ao buscar lista de exercício:", error);
      throw new Error(
        "Ocorreu um erro ao buscar lista de exercício: " + error
      );
    }
  }

  async findAllStudentsByExerciseListId(exercise_list_id: string) {
    try {
      const token = await this.getToken();

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user-progress/exercise_list/${exercise_list_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Erro ao buscar exercício:", error);
      throw new Error("Ocorreu um erro ao buscar exercício: " + error);
    }
  }


  async updateExerciseListAndLessonPlans(
    id: string,
    name?: string,
    content?: string,
    teacher_id?: string,
    exercises_ids?: string[],
    lesson_plan_ids?: string[],
    type?: string,
    due_date?: string,
    points?: number
  ): Promise<IExerciseList | null> {
    try {
      const token = await this.getToken();

      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/exercise_lists/${id}`,
        {
          name,
          content,
          teacher_id,
          exercises_ids,
          lesson_plan_ids,
          type,
          due_date,
          points,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar lista de exercício:", error);
      throw new Error(
        "Ocorreu um erro ao atualizar lista de exercício: " + error
      );
    }
  }

  async isExerciseListCompleted(exercise_list_id: string) {
    try {
      const token = await this.getToken();

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/exercise_lists/${exercise_list_id}/completed`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(
        "Erro ao verificar se uma lista de exercício foi completado:",
        error
      );
      throw new Error(
        "Erro ao verificar se uma lista de exercício foi completado: " + error
      );
    }
  }

  async getUserProgressByLessonPlanAndType(
    lesson_plan_id: string,
    type: string
  ) {
    try {
      const token = await this.getToken();

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user-progress/${lesson_plan_id}/${type}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Erro ao buscar progresso do aluno:", error);
      throw new Error("Ocorreu um erro ao buscar progresso do aluno: " + error);
    }
  }

  async findAllStudentsByExerciseId(exerciseId: string) {
    try {
      const token = await this.getToken();

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user-progress/exercise/${exerciseId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Erro ao buscar exercício:", error);
      throw new Error("Ocorreu um erro ao buscar exercício: " + error);
    }
  }

  async findAllStudentsByLessonPlanId(lesson_plan_id: string) {
    try {
      const token = await this.getToken();

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user-progress/lesson_plan/${lesson_plan_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Erro ao buscar alunos do plano de aula:", error);
      throw new Error(
        "Ocorreu um erro ao buscar alunos do plano de aula: " + error
      );
    }
  }

  async isExerciseCompleted(exercise_id: string) {
    try {
      const token = await this.getToken();

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/exercises/${exercise_id}/completed`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Erro ao verificar se exercício foi completado:", error);
      throw new Error("Erro ao verificar status do exercício: " + error);
    }
  }

  async getUserStats() {
    try {
      const token = await this.getToken();

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Erro ao buscar dados do usuário:", error);
      throw new Error("Ocorreu um erro ao buscar dados do usuário: " + error);
    }
  }

  async getAllLessonPlanContent() {
    try {
      const token = await this.getToken();

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/lesson-plan-contents`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Erro ao buscar conteúdos do plano de aula:", error);
      throw new Error(
        "Ocorreu um erro ao buscar conteúdos do plano de aula: " + error
      );
    }
  }

  async getAssociationsByContent(content_id: string, content_type: string) {
    try {
      const token = await this.getToken();

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/lesson-plan-contents/associations`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            content_id,
            content_type,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Erro ao buscar conteúdos do plano de aula:", error);
      throw new Error(
        "Ocorreu um erro ao buscar conteúdos do plano de aula: " + error
      );
    }
  }

  async createAvatar(avatar: {
    torso: string;
    head: string;
    eyes: string;
  }): Promise<IAvatar | null> {
    try {
      const token = await this.getToken();

      if (!token) return null;

      const decoded = jwtDecode<TokenPayload>(token);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_GAME_BACKEND_URL}/avatar`,
        { ...avatar, user_id: decoded._id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Erro ao criar avatar:", error);
      throw new Error("Ocorreu um erro ao criar avatar" + error);
    }
  }

  async getAvatarByUserId(): Promise<IAvatar | null> {
    try {
      const token = await this.getToken();
      if (!token) return null;
      const decoded = jwtDecode<TokenPayload>(token);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_GAME_BACKEND_URL}/avatar/${decoded._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Erro ao buscar avatar:", error);
      throw new Error("Ocorreu um erro ao buscar avatar: " + error);
    }
  }

  async updateAvatar(avatar: IAvatar): Promise<IAvatar | null> {
    try {
      const token = await this.getToken();
      if (!token) return null;
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_GAME_BACKEND_URL}/avatar`,
        avatar,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar avatar:", error);
      throw new Error("Ocorreu um erro ao atualizar avatar: " + error);
    }
  }

  async getFile(filename: string): Promise<string> {
    try {
      const token = await this.getToken();
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}${filename}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            responseType: "blob",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar arquivo:", error);
      throw new Error("Ocorreu um erro ao buscar arquivo: " + error);
    }
  }

  async getRanking(lessonPlanId: string): Promise<IRanking[]> {
    try {
      const token = await this.getToken();

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user-progress/ranking/${lessonPlanId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Erro ao buscar ranking do plano de aula:", error);
      throw new Error(
        "Ocorreu um erro ao buscar ranking do plano de aula: " + error
      );
    }
  }
}
