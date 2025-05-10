import {
  ILessonPlan,
  ILessonPlanByRole,
} from "./interfaces/lesson-plan.interface";

import { IExercise } from "./interfaces/exercise.interface";
import { ILesson } from "./interfaces/lesson.interface";
import { IUser } from "./interfaces/user.interface";
import axios from "axios";

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

      console.log("Plano de aula criado:", response.data);

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

      console.log("Plano de aula atualizado:", response.data);

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

      console.log("Plano de aula deletado:", response.data);

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
    lesson_plan_id: string
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
          lesson_plan_id,
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

  async updateLesson(
    id: string,
    name: string,
    due_date: string,
    content: string,
    links: string,
    points: number,
    type: string,
    grade: number,
    lesson_plan_id: string
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
          lesson_plan_id,
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
    options?: any[]
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
          options,
          teacher_id,
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

  async updateExercise(
    id: string,
    statement: string,
    type: string,
    answer: string,
    showAnswer: boolean,
    options?: any[]
  ): Promise<IExercise | null> {
    try {
      const token = await this.getToken();

      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/exercises/${id}`,
        {
          statement,
          type,
          answer,
          showAnswer,
          options,
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

  async submitMultipleChoiceAnswer(exerciseId: string, answer: string) {
    try {
      const token = await this.getToken();

      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/exercises/${exerciseId}/multiple-choice`,
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
    id: string,
    final_grade: number,
    points: number
  ): Promise<any> {
    try {
      const token = await this.getToken();

      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/exercises/${id}/teacher-correction`,
        {
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
}
