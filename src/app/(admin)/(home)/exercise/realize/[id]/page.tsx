"use client";

import { useEffect, useState } from "react";
import { HttpRequest } from "@/utils/http-request";
import { IExercise } from "@/utils/interfaces/exercise.interface";
import Label from "@/components/form/Label";
import TextArea from "@/components/form/input/TextArea";
import { useParams } from "next/navigation";
import { ILessonPlanByRole } from "@/utils/interfaces/lesson-plan.interface";
import { jwtDecode } from "jwt-decode";
import { TokenPayload } from "../../form/page";
import LessonPlanBreadcrumb from "@/components/ui/breadcrumb/LessonPlanBreadcrumb";

const ExerciseDetailsPage = () => {
  const params = useParams();
  const exerciseId = params.id as string;
  const [exercise, setExercise] = useState<IExercise | null>(null);
  const [lessonPlanId, setLessonPlanId] = useState<string | null>(null);
  const [lessonPlanName, setLessonPlanName] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<{
    [key: string]: string;
  }>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchExerciseDetails = async () => {
      if (!exerciseId) return;
      const httpRequest = new HttpRequest();
      const response = await httpRequest.getExerciseById(exerciseId);

      setExercise(response);

      try {
        const associations = await httpRequest.getAssociationsByContent(
          exerciseId,
          "exercise"
        );
        if (associations && associations.length > 0) {
          const planId = associations[0].lesson_plan_id;
          setLessonPlanId(planId);
          const plans: ILessonPlanByRole[] =
            await httpRequest.getLessonPlansByRole();
          const found = plans.find((p) => p.lessonplan._id === planId);
          if (found) {
            setLessonPlanName(found.lessonplan.name);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar plano de aula:", error);
      }
    };

    fetchExerciseDetails();
  }, [exerciseId]);

  useEffect(() => {
    const checkCompleted = async () => {
      if (!exerciseId) return;
      const httpRequest = new HttpRequest();
      try {
        const result = await httpRequest.isExerciseCompleted(exerciseId);
        const token = await httpRequest.getToken();
        const decoded = jwtDecode<TokenPayload>(token);

        if (result && result.completed) {
          const data = await httpRequest.findAllStudentsByExerciseId(
            exerciseId
          );
          setSubmitted(true);
          const userAnswer = data.find(
            (item) => item.user_id._id === decoded._id
          );
          if (userAnswer.answer) {
            if (
              exercise?.type === "true_false" &&
              exercise.true_false_options
            ) {
              exercise.true_false_options.forEach((alt, idx) => {
                const char = userAnswer.answer[idx];
                setSelectedAnswer((prev) => ({
                  ...prev,
                  [alt._id]: char === "V" ? "true" : "false",
                }));
              });
            } else {
              setSelectedAnswer({ [exerciseId]: userAnswer.answer });
            }
          }
        }
      } catch (err) {
        console.error("Erro ao verificar exercício:", err);
      }
    };

    checkCompleted();
  }, [exerciseId, exercise]);

  const handleAnswerSubmission = async (e: React.FormEvent) => {
    e.preventDefault();

    const httpRequest = new HttpRequest();
    let answerString = "";

    if (exercise?.type === "true_false") {
      exercise.true_false_options?.forEach((alternative) => {
        const answer = selectedAnswer[alternative._id];
        if (answer === "true") {
          answerString += "V";
        } else if (answer === "false") {
          answerString += "F";
        }
      });
    } else if (
      exercise?.type === "open" ||
      exercise?.type === "multiple_choice"
    ) {
      answerString = selectedAnswer[exerciseId];
    }

    await httpRequest.submitAnswer(exerciseId, answerString);

    setSubmitted(true);
  };

  const handleAnswerChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setSelectedAnswer((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (!exercise) return <div>Carregando...</div>;

  const formattedDate = exercise.due_date
    ? new Date(exercise.due_date).toLocaleDateString()
    : null;

  return (
    <div className="px-40 flex flex-1 justify-center py-5">
      <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
        <LessonPlanBreadcrumb
          lessonPlanId={lessonPlanId}
          lessonPlanName={lessonPlanName}
          currentName={exercise.statement}
        />

        <div className="flex flex-wrap justify-between gap-3 p-4">
          <div className="flex min-w-72 flex-col gap-3">
            <p className="text-[#0e141b] tracking-light text-[20px] font-semibold leading-tight whitespace-pre-wrap break-words text-justify">
              {exercise.statement}
            </p>
            {formattedDate && (
              <p className="text-[#4e7097] text-sm font-normal leading-normal">
                Data de entrega: {formattedDate}
              </p>
            )}
          </div>
        </div>

        <form onSubmit={handleAnswerSubmission} className="px-4">
          {exercise.type === "open" && (
            <div className="mt-6">
              <h2 className="text-base font-medium text-gray-800 dark:text-white/90">
                Sua Resposta
              </h2>
              <TextArea
                value={selectedAnswer[exerciseId] || ""}
                onChange={(e) =>
                  setSelectedAnswer({
                    ...selectedAnswer,
                    [exerciseId]: e.target.value,
                  })
                }
                className="w-full h-40 mt-2 p-4 border border-gray-300 rounded-md"
                placeholder="Digite sua resposta aqui"
                required
                disabled={submitted}
              />
            </div>
          )}

          {exercise.type === "multiple_choice" && (
            <div className="mt-6">
              <h2 className="text-base font-medium text-gray-800 dark:text-white/90">
                Alternativas
              </h2>
              <div className="space-y-4 mt-4">
                {exercise.multiple_choice_options?.map((option, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 border-b border-gray-300 pb-3"
                  >
                    <input
                      type="radio"
                      id={`alternative-${index}`}
                      name={`multiple_choice-${exerciseId}`}
                      value={option}
                      checked={selectedAnswer[exerciseId] === option}
                      onChange={(e) =>
                        setSelectedAnswer({
                          ...selectedAnswer,
                          [exerciseId]: e.target.value,
                        })
                      }
                      className="h-5 w-5 text-blue-500 border-gray-300 rounded"
                      required
                      disabled={submitted}
                    />
                    <Label
                      htmlFor={`alternative-${index}`}
                      className="text-xl text-gray-700"
                    >
                      {option}
                    </Label>
                    {submitted && selectedAnswer[exerciseId] === option && (
                      <span className="ml-2 text-green-700"></span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {exercise.type === "true_false" && exercise.true_false_options && (
            <div className="mt-6">
              <h2 className="text-base font-medium text-gray-800 dark:text-white/90">
                Proposições
              </h2>
              {exercise.true_false_options?.map((alternative) => (
                <div key={alternative._id} className="mt-4">
                  <p className="text-lg font-medium text-gray-800 dark:text-white/90">
                    {alternative.statement}
                  </p>
                  <div className="flex items-center space-x-6 mt-4">
                    <input
                      type="radio"
                      id={`true-${alternative._id}`}
                      name={`true_false-${alternative._id}`}
                      value="true"
                      checked={selectedAnswer[alternative._id] === "true"}
                      onChange={() =>
                        setSelectedAnswer((prev) => ({
                          ...prev,
                          [alternative._id]: "true",
                        }))
                      }
                      className="h-5 w-5 text-blue-500 border-gray-300 rounded"
                      required
                      disabled={submitted}
                    />
                    <label
                      htmlFor={`true-${alternative._id}`}
                      className="text-lg font-light text-gray-800 dark:text-white/90"
                    >
                      Verdadeiro
                    </label>
                    <input
                      type="radio"
                      id={`false-${alternative._id}`}
                      name={`true_false-${alternative._id}`}
                      value="false"
                      checked={selectedAnswer[alternative._id] === "false"}
                      onChange={() =>
                        setSelectedAnswer((prev) => ({
                          ...prev,
                          [alternative._id]: "false",
                        }))
                      }
                      className="h-5 w-5 text-blue-500 border-gray-300 rounded"
                      required
                      disabled={submitted}
                    />
                    <label
                      htmlFor={`false-${alternative._id}`}
                      className="text-lg font-light text-gray-800 dark:text-white/90"
                    >
                      Falso
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={submitted}
            className={`mt-6 w-full py-3 text-white font-semibold rounded-md shadow-md ${
              submitted
                ? "bg-green-600 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {submitted ? "Resposta Enviada" : "Confirmar Resposta"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ExerciseDetailsPage;
