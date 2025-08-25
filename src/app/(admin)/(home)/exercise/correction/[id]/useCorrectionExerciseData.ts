import { useState, useEffect } from "react";
import { HttpRequest } from "@/utils/http-request";
import { IExercise } from "@/utils/interfaces/exercise.interface";
import { StudentAnswer } from "@/utils/interfaces/correction.types"; 
import { ILessonPlanByRole } from "@/utils/interfaces/lesson-plan.interface";

export const useIndividualExerciseData = (
  exerciseId: string | null,
  lessonPlanIdFromUrl: string | null
) => {
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
        let finalPlanId = lessonPlanIdFromUrl;

        if (!finalPlanId) {
          const associations = await httpRequest.getAssociationsByContent(
            exerciseId,
            "exercise"
          );
          if (associations && associations.length > 0) {
            finalPlanId = associations[0].lesson_plan_id;
          }
        }

        if (!finalPlanId) {
          throw new Error(
            "Este exercício não está associado a nenhum plano de aula."
          );
        }

        const [answersData, exerciseData, allPlans] = await Promise.all([
          httpRequest.findAllStudentsByExerciseId(exerciseId, finalPlanId),
          httpRequest.getExerciseById(exerciseId),
          httpRequest.getLessonPlansByRole(),
        ]);

        setStudentsAnswers(answersData);
        setExercise(exerciseData);

        const foundPlan = allPlans.find(
          (p: ILessonPlanByRole) => p.lessonplan._id === finalPlanId
        );

        if (foundPlan) {
          setLessonPlanInfo({
            id: finalPlanId,
            name: foundPlan.lessonplan.name,
          });
        }
      } catch (err: any) {
        console.error("Erro ao buscar dados da correção:", err);
        setError(err.message || "Não foi possível carregar os dados.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [exerciseId, lessonPlanIdFromUrl]); 

  return {
    studentsAnswers,
    setStudentsAnswers,
    exercise,
    lessonPlanInfo,
    isLoading,
    error,
  };
};
