"use client";

import { useEffect, useState, useMemo } from "react";
import { HttpRequest } from "@/utils/http-request";
import { IExerciseList } from "@/utils/interfaces/exercise_list.interface";
import { IExercise } from "@/utils/interfaces/exercise.interface";
import Label from "@/components/form/Label";
import TextArea from "@/components/form/input/TextArea";
import { useParams } from "next/navigation";
import { ILessonPlanByRole } from "@/utils/interfaces/lesson-plan.interface";
import { jwtDecode } from "jwt-decode";
import { TokenPayload } from "../../../exercise/form/page";
import LessonPlanBreadcrumb from "@/components/ui/breadcrumb/LessonPlanBreadCrumb";

const ExerciseListRealizePage = () => {
  const params = useParams();
  const exercise_list_id = params.id as string;
  const [exerciseList, setExerciseList] = useState<IExerciseList | null>(null);
  const [lessonPlanId, setLessonPlanId] = useState<string | null>(null);
  const [lessonPlanName, setLessonPlanName] = useState<string | null>(null);
  type AnswerMap = {
    [exerciseId: string]: string | Record<string, string>;
  };
  const [selectedAnswer, setSelectedAnswer] = useState<AnswerMap>({});
  const [submitted, setSubmitted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const httpRequest = useMemo(() => new HttpRequest(), []);

  useEffect(() => {
    const fetchListDetails = async () => {
      if (!exercise_list_id) return;
      const list = await httpRequest.getExerciseListById(exercise_list_id);
      const exercises: IExercise[] = await Promise.all(
        list.exercises_ids.map((id: string) => httpRequest.getExerciseById(id))
      );
      setExerciseList({ ...list, exercises });

      try {
        const associations = await httpRequest.getAssociationsByContent(
          exercise_list_id,
          "exercise_list"
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

    fetchListDetails();
  }, [exercise_list_id, httpRequest]);

  useEffect(() => {
    const checkCompleted = async () => {
      if (!exercise_list_id || !exerciseList) return;
      try {
        const result = await httpRequest.isExerciseListCompleted(
          exercise_list_id
        );
        if (result && result.completed) {
          setSubmitted(true);
          const token = await httpRequest.getToken();
          const decoded = token ? jwtDecode<TokenPayload>(token) : null;
          for (const ex of exerciseList.exercises || []) {
            const data = await httpRequest.findAllStudentsByExerciseId(
              ex._id,
              lessonPlanId as string
            );
            const userAnswer = data.find(
              (item: { user_id: { _id: string }; answer: string }) =>
                decoded && item.user_id._id === decoded._id
            );
            if (userAnswer?.answer) {
              if (ex.type === "true_false" && ex.true_false_options) {
                ex.true_false_options.forEach((alt, idx) => {
                  const char = userAnswer.answer[idx];
                  const key = alt._id || String(idx);
                  setSelectedAnswer((prev) => {
                    const exAns =
                      typeof prev[ex._id] === "string"
                        ? {}
                        : (prev[ex._id] as Record<string, string>) || {};
                    return {
                      ...prev,
                      [ex._id]: {
                        ...exAns,
                        [key]: char === "V" ? "true" : "false",
                      },
                    };
                  });
                });
              } else {
                setSelectedAnswer((prev) => ({
                  ...prev,
                  [ex._id]: userAnswer.answer,
                }));
              }
            }
          }
        }
      } catch (err) {
        console.error("Erro ao verificar lista:", err);
      }
    };

    checkCompleted();
  }, [exercise_list_id, exerciseList, lessonPlanId, httpRequest]);

  const handleAnswer = (exId: string, name: string, value: string) => {
    setSelectedAnswer((prev) => {
      const exAns = typeof prev[exId] === "string" ? {} : prev[exId] || {};
      return {
        ...prev,
        [exId]: name === exId ? value : { ...exAns, [name]: value },
      };
    });
  };

  const handleNavigateQuestion = (direction: "next" | "prev") => {
    if (!exerciseList?.exercises) return;
    if (direction === "next") {
      setCurrentQuestionIndex((prev) =>
        Math.min(prev + 1, exerciseList.exercises.length - 1)
      );
    } else {
      setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exerciseList) return;

    for (const exercise of exerciseList.exercises || []) {
      let answerString = "";
      if (exercise.type === "true_false" && exercise.true_false_options) {
        exercise.true_false_options.forEach((alt, idx) => {
          const key = alt._id || String(idx);
          const exAns = selectedAnswer[exercise._id];
          const val =
            typeof exAns === "string" ? undefined : (exAns || {})[key];
          if (val === "true") answerString += "V";
          else if (val === "false") answerString += "F";
        });
      } else {
        answerString = selectedAnswer[exercise._id] as string;
      }
      await httpRequest.submitExerciseListAnswers(
        exercise._id,
        exercise_list_id,
        answerString
      );
    }
    setSubmitted(true);
  };

  if (!exerciseList) return <div>Carregando...</div>;

  const formattedDate = exerciseList.due_date
    ? new Date(exerciseList.due_date).toLocaleDateString()
    : null;
  const totalQuestions = exerciseList.exercises?.length || 0;
  const currentExercise = exerciseList.exercises?.[currentQuestionIndex];

  return (
    <div className="px-40 flex flex-1 justify-center py-5">
      <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
        <LessonPlanBreadcrumb
          lessonPlanId={lessonPlanId}
          lessonPlanName={lessonPlanName}
          currentName={exerciseList.name}
        />
        <div className="flex flex-wrap justify-between gap-3 p-4">
          <div className="flex min-w-72 flex-col gap-3">
            <p className="text-[#0e141b] tracking-light text-[20px] font-semibold leading-tight">
              {exerciseList.name}
            </p>
            {formattedDate && (
              <p className="text-[#4e7097] text-sm font-normal leading-normal">
                Data de entrega: {formattedDate}
              </p>
            )}
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6 px-4">
          <div className="bg-white border border-gray-200 rounded-lg p-5 flex justify-between items-center">
            <span className="font-semibold text-gray-600">
              Questão {currentQuestionIndex + 1} de {totalQuestions}
            </span>
          </div>
          {currentExercise && (
            <div key={currentExercise._id}>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white/90">
                {currentExercise.statement}
              </h2>
              {currentExercise.type === "open" && (
                <div className="mt-2">
                  <TextArea
                    value={
                      typeof selectedAnswer[currentExercise._id] === "string"
                        ? (selectedAnswer[currentExercise._id] as string)
                        : ""
                    }
                    onChange={(value) =>
                      handleAnswer(
                        currentExercise._id,
                        currentExercise._id,
                        value
                      )
                    }
                    className="w-full h-40 mt-2 p-4 border border-gray-300 rounded-md"
                    placeholder="Digite sua resposta aqui"
                    required
                    disabled={submitted}
                  />
                </div>
              )}
              {currentExercise.type === "multiple_choice" && (
                <div className="mt-2 space-y-4">
                  {currentExercise.multiple_choice_options?.map(
                    (option, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 border-b border-gray-300 pb-3"
                      >
                        <input
                          type="radio"
                          id={`${currentExercise._id}-opt-${index}`}
                          name={currentExercise._id}
                          value={option}
                          checked={
                            typeof selectedAnswer[currentExercise._id] ===
                              "string" &&
                            selectedAnswer[currentExercise._id] === option
                          }
                          onChange={(e) =>
                            handleAnswer(
                              currentExercise._id,
                              currentExercise._id,
                              e.target.value
                            )
                          }
                          className="h-5 w-5 text-blue-500 border-gray-300 rounded"
                          required
                          disabled={submitted}
                        />
                        <Label
                          htmlFor={`${currentExercise._id}-opt-${index}`}
                          className="text-xl text-gray-700"
                        >
                          {option}
                        </Label>
                      </div>
                    )
                  )}
                </div>
              )}
              {currentExercise.type === "true_false" &&
                currentExercise.true_false_options && (
                  <div className="mt-2">
                    {currentExercise.true_false_options.map(
                      (alternative, idx) => {
                        const key = alternative._id || String(idx);
                        return (
                          <div key={key} className="mt-4">
                            <p className="text-lg font-medium text-gray-800 dark:text-white/90">
                              {alternative.statement}
                            </p>
                            <div className="flex items-center space-x-6 mt-4">
                              <input
                                type="radio"
                                id={`true-${key}`}
                                name={`${currentExercise._id}-${key}`}
                                value="true"
                                checked={
                                  typeof selectedAnswer[currentExercise._id] !==
                                    "string" &&
                                  (
                                    selectedAnswer[currentExercise._id] as
                                      | Record<string, string>
                                      | undefined
                                  )?.[key] === "true"
                                }
                                onChange={() =>
                                  handleAnswer(currentExercise._id, key, "true")
                                }
                                className="h-5 w-5 text-blue-500 border-gray-300 rounded"
                                required
                                disabled={submitted}
                              />
                              <label
                                htmlFor={`true-${key}`}
                                className="text-lg font-light text-gray-800 dark:text-white/90"
                              >
                                Verdadeiro
                              </label>
                              <input
                                type="radio"
                                id={`false-${key}`}
                                name={`${currentExercise._id}-${key}`}
                                value="false"
                                checked={
                                  typeof selectedAnswer[currentExercise._id] !==
                                    "string" &&
                                  (
                                    selectedAnswer[currentExercise._id] as
                                      | Record<string, string>
                                      | undefined
                                  )?.[key] === "false"
                                }
                                onChange={() =>
                                  handleAnswer(
                                    currentExercise._id,
                                    key,
                                    "false"
                                  )
                                }
                                className="h-5 w-5 text-blue-500 border-gray-300 rounded"
                                required
                                disabled={submitted}
                              />
                              <label
                                htmlFor={`false-${key}`}
                                className="text-lg font-light text-gray-800 dark:text-white/90"
                              >
                                Falso
                              </label>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}
            </div>
          )}
          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={() => handleNavigateQuestion("prev")}
              disabled={currentQuestionIndex === 0 || submitted}
              className="px-6 py-2 bg-white border border-gray-300 rounded-lg font-semibold text-gray-700 disabled:opacity-50"
            >
              Anterior
            </button>
            {currentQuestionIndex === totalQuestions - 1 ? (
              <button
                type="submit"
                disabled={submitted}
                className={`px-6 py-2 text-white font-semibold rounded-lg shadow-md ${
                  submitted
                    ? "bg-green-600 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                {submitted ? "Respostas Enviadas" : "Confirmar Respostas"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleNavigateQuestion("next")}
                disabled={submitted}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold disabled:opacity-50"
              >
                Próxima
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExerciseListRealizePage;
