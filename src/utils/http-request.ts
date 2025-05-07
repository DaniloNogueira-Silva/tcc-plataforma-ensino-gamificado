import {
  ILessonPlan,
  ILessonPlanByRole,
} from "./interfaces/lesson-plan.interface";

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

    localStorage.setItem("token", response.data);

    return response.data;
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
    console.log(response.data);
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
}
