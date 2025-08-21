import { useState, useEffect } from "react";
import { HttpRequest } from "@/utils/http-request";
import { IExercise } from "@/utils/interfaces/exercise.interface";
import { StudentAnswer } from "@/utils/interfaces/correction.types";
import { ILessonPlanByRole } from "@/utils/interfaces/lesson-plan.interface";

export const useIndividualExerciseData = (exerciseId: string | null) => {
  const [studentsAnswers, setStudentsAnswers] = useState<StudentAnswer[]>([]);
  const [exercise, setExercise] = useState<IExercise | null>(null);
  const [lessonPlanInfo, setLessonPlanInfo] = useState<{
    id: string | null;
    name: string | null;
  }>({ id: null, name: null });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!exerciseId) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      const httpRequest = new HttpRequest();

      try {
        const [answersData, exerciseData] = await Promise.all([
          httpRequest.findAllStudentsByExerciseId(exerciseId),
          httpRequest.getExerciseById(exerciseId),
        ]);

        setStudentsAnswers(answersData);
        setExercise(exerciseData);

        const associations = await httpRequest.getAssociationsByContent(
          exerciseId,
          "exercise"
        );
        if (associations && associations.length > 0) {
          const planId = associations[0].lesson_plan_id;
          const plans = await httpRequest.getLessonPlansByRole();
          const foundPlan = plans.find(
            (p: ILessonPlanByRole) => p.lessonplan._id === planId
          );
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
  }, [exerciseId]);

  return {
    studentsAnswers,
    setStudentsAnswers,
    exercise,
    lessonPlanInfo,
    isLoading,
    error,
  };
};
