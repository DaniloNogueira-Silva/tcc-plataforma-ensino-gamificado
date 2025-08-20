import { useState, useEffect } from "react";
import { HttpRequest } from "@/utils/http-request";
import { IExerciseList } from "@/utils/interfaces/exercise_list.interface";
import { StudentAnswer } from "./page"; // A interface virá do page.tsx ou de um arquivo de tipos

export const useCorrectionData = (listId: string | null) => {
  const [studentsAnswers, setStudentsAnswers] = useState<StudentAnswer[]>([]);
  const [exerciseList, setExerciseList] = useState<IExerciseList | null>(null);
  const [lessonPlanInfo, setLessonPlanInfo] = useState<{
    id: string | null;
    name: string | null;
  }>({ id: null, name: null });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!listId) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      const httpRequest = new HttpRequest();

      try {
        // As duas chamadas principais são feitas em paralelo para otimizar o tempo de carregamento
        const [progresses, listData] = await Promise.all([
          httpRequest.findStudentsAnswersByExerciseListId(listId),
          httpRequest.getExerciseListById(listId),
        ]);

        // 1. Processa as respostas dos alunos, buscando as tentativas de cada um
        const studentsWithAttempts = await Promise.all(
          progresses.map(async (prog: any) => {
            const attempts =
              await httpRequest.getExerciseListAttemptsByUserProgress(prog._id);
            return { ...prog, attempts } as StudentAnswer;
          })
        );
        setStudentsAnswers(studentsWithAttempts);

        // 2. Processa a lista de exercícios, buscando os detalhes de cada exercício
        const exercises = await Promise.all(
          listData.exercises_ids.map((id: string) =>
            httpRequest.getExerciseById(id)
          )
        );
        setExerciseList({ ...listData, exercises });

        // 3. (Opcional) Busca dados do plano de aula associado
        const associations = await httpRequest.getAssociationsByContent(
          listId,
          "exercise_list"
        );
        if (associations && associations.length > 0) {
          const planId = associations[0].lesson_plan_id;
          const plans = await httpRequest.getLessonPlansByRole();
          const foundPlan = plans.find((p: any) => p.lessonplan._id === planId);
          if (foundPlan) {
            setLessonPlanInfo({ id: planId, name: foundPlan.lessonplan.name });
          }
        }
      } catch (err) {
        console.error("Erro ao buscar dados da correção:", err);
        setError(
          "Não foi possível carregar os dados. Tente recarregar a página."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [listId]);

  // O hook retorna todos os dados e estados que a página precisa
  return {
    studentsAnswers,
    setStudentsAnswers,
    exerciseList,
    lessonPlanInfo,
    isLoading,
    error,
  };
};
