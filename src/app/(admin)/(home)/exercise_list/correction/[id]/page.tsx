"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { HttpRequest } from "@/utils/http-request";
import { IExerciseList } from "@/utils/interfaces/exercise_list.interface";
import { IExerciseListAttempt } from "@/utils/interfaces/exercise_list_attempt.interface";
import Notification from "@/components/ui/notification/Notification";
import Input from "@/components/form/input/InputField";
import { Search } from "lucide-react";
import LessonPlanBreadcrumb from "@/components/ui/breadcrumb/LessonPlanBreadcrumb";
import { ILessonPlanByRole } from "@/utils/interfaces/lesson-plan.interface";

interface StudentAnswer {
  user_id: { _id: string; name: string };
  _id: string;
  final_grade?: number;
  attempts: IExerciseListAttempt[];
}

const ExerciseListCorrectionPage = () => {
  const params = useParams();
  const listId = params.id as string;

  const [studentsAnswers, setStudentsAnswers] = useState<StudentAnswer[]>([]);
  const [selectedStudentIndex, setSelectedStudentIndex] = useState<number>(0);
  const [exerciseList, setExerciseList] = useState<IExerciseList | null>(null);
  const [grade, setGrade] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [lessonPlanId, setLessonPlanId] = useState<string | null>(null);
  const [lessonPlanName, setLessonPlanName] = useState<string | null>(null);

  const httpRequest = new HttpRequest();

  useEffect(() => {
    async function fetchStudentsAnswers() {
      if (!listId) return;
      const progresses = await httpRequest.findAllStudentsByExerciseListId(
        listId
      );
      const withAttempts = await Promise.all(
        progresses.map(async (prog: Omit<StudentAnswer, "attempts">) => {
          const attempts =
            await httpRequest.getExerciseListAttemptsByUserProgress(prog._id);
          return { ...prog, attempts } as StudentAnswer;
        })
      );
      setStudentsAnswers(withAttempts);
      setSelectedStudentIndex(0);
    }
    fetchStudentsAnswers();
  }, [listId]);

  useEffect(() => {
    async function fetchList() {
      if (!listId) return;
      const list = await httpRequest.getExerciseListById(listId);
      const exercises = await Promise.all(
        list.exercises_ids.map((id: string) => httpRequest.getExerciseById(id))
      );
      setExerciseList({ ...list, exercises });

      try {
        const associations = await httpRequest.getAssociationsByContent(
          listId,
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
    }
    fetchList();
  }, [listId]);

  useEffect(() => {
    if (studentsAnswers.length === 0) return;

    const currentStudent = studentsAnswers[selectedStudentIndex];
    if (!currentStudent) return;

    const existingGrade = currentStudent.final_grade;

    if (existingGrade !== undefined && existingGrade !== null) {
      setGrade(existingGrade.toString());
      setIsEditing(false);
    } else {
      setGrade("");
      setIsEditing(true);
    }
  }, [selectedStudentIndex, studentsAnswers]);

  if (!exerciseList) {
    return <div>Carregando...</div>;
  }

  if (studentsAnswers.length === 0) {
    return <div>Nenhum aluno respondeu</div>;
  }

  const filteredStudents = studentsAnswers.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedAnswerObj = studentsAnswers[selectedStudentIndex];
  const selectedStudentName = selectedAnswerObj?.user_id?.name || "";
  const handleSubmitGrade = async () => {
    if (grade === "" || isNaN(Number(grade))) {
      setShowErrorNotification(true);
      setTimeout(() => setShowErrorNotification(false), 3000);
      return;
    }

    const numericGrade = Number(grade);
    if (numericGrade < 0 || numericGrade > 100) {
      setShowErrorNotification(true);
      setTimeout(() => setShowErrorNotification(false), 3000);
      return;
    }

    try {
      await Promise.all(
        selectedAnswerObj.attempts.map((attempt) =>
          httpRequest.gradeExerciseListAttempt(attempt._id, numericGrade)
        )
      );

      const updatedStudents = [...studentsAnswers];
      updatedStudents[selectedStudentIndex] = {
        ...updatedStudents[selectedStudentIndex],
        final_grade: numericGrade,
        attempts: updatedStudents[selectedStudentIndex].attempts.map((a) => ({
          ...a,
          grade: numericGrade,
        })),
      };
      setStudentsAnswers(updatedStudents);

      setIsEditing(false);
      setShowSuccessNotification(true);
      setTimeout(() => setShowSuccessNotification(false), 3000);
    } catch (err) {
      console.error("Erro ao enviar nota:", err);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  return (
    <>
      {showSuccessNotification && (
        <div
          className={`fixed top-24 right-5 z-[9999] max-w-xs transition-transform duration-300 ease-in-out ${
            showSuccessNotification
              ? "translate-x-0 opacity-100"
              : "translate-x-20 opacity-0 pointer-events-none"
          }`}
          style={{ maxWidth: 340 }}
        >
          <Notification variant="success" title="Nota enviada com sucesso" />
        </div>
      )}

      {showErrorNotification && (
        <div
          className={`fixed top-24 right-5 z-[9999] max-w-xs transition-transform duration-300 ease-in-out ${
            showErrorNotification
              ? "translate-x-0 opacity-100"
              : "translate-x-20 opacity-0 pointer-events-none"
          }`}
          style={{ maxWidth: 340 }}
        >
          <Notification variant="error" title="Erro: Nota inválida ou vazia" />
        </div>
      )}

      <div className="flex flex-col gap-4 px-6 py-5">
        <div className="flex w-full">
          <LessonPlanBreadcrumb
            lessonPlanId={lessonPlanId}
            lessonPlanName={lessonPlanName}
            currentName={exerciseList.name}
          />
        </div>
        <div className="flex flex-1 gap-6">
          <div className="w-80 flex flex-col">
            <h2 className="px-4 pt-5 text-[22px] font-bold leading-tight tracking-tight text-[#111418]">
              Alunos
            </h2>
            <div className="py-3">
              <label className="flex h-12 min-w-40 w-full flex-col">
                <div className="flex h-full w-full flex-1 items-stretch rounded-lg">
                  <div className="flex items-center justify-center rounded-l-lg bg-[#f0f2f5] pl-2 text-[#60748a]">
                    <Search size={24} strokeWidth={2} />
                  </div>
                  <input
                    placeholder="Buscar alunos"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input h-full w-full flex-1 resize-none rounded-l-none rounded-lg border-none bg-[#f0f2f5] px-4 pl-2 text-base font-normal leading-normal text-[#111418] placeholder:text-[#60748a] focus:outline-none"
                  />
                </div>
              </label>
            </div>
            {filteredStudents.map((student) => {
              const globalIdx = studentsAnswers.findIndex(
                (s) => s._id === student._id
              );
              const hasGrade =
                student.final_grade !== undefined &&
                student.final_grade !== null;
              return (
                <div
                  key={student._id}
                  onClick={() => setSelectedStudentIndex(globalIdx)}
                  className={`flex items-center gap-4 px-4 py-2 min-h-[72px] rounded cursor-pointer ${
                    globalIdx === selectedStudentIndex
                      ? "bg-gray-100"
                      : "bg-white"
                  }`}
                >
                  <div className="flex flex-col justify-center">
                    <p className="text-base font-medium leading-normal text-[#111418] line-clamp-1">
                      {student.user_id?.name ||
                        (student as unknown as RawStudent).name}
                    </p>
                    <p
                      className={`text-sm font-normal leading-normal ${
                        hasGrade ? "text-green-600" : "text-red-500"
                      } line-clamp-2`}
                    >
                      {hasGrade ? "Nota Enviada" : "Sem nota"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex-1 max-w-[960px] flex flex-col px-2">
            <h1 className="pb-2 pt-4 text-2xl font-bold leading-tight tracking-tight text-[#111418]">
              {exerciseList.name}
            </h1>
            {exerciseList.exercises?.map((exercise, idx) => {
              const attempt = selectedAnswerObj.attempts.find(
                (a) => a.exercise_id === exercise._id
              );
              const answer = attempt?.answer || "";

              return (
                <div key={exercise._id} className="mb-6">
                  <h2 className="text-base font-medium text-gray-800 dark:text-white/90">
                    {idx + 1}. {exercise.statement}
                  </h2>
                  {exercise.type === "open" && (
                    <textarea
                      readOnly
                      value={answer}
                      className="w-full h-40 p-3 border border-gray-300 rounded resize-none bg-gray-100 dark:bg-gray-800 dark:text-white/90"
                    />
                  )}

                  {exercise.type === "multiple_choice" && (
                    <div>
                      {exercise.multiple_choice_options?.map((option) => {
                        const isSelected = answer === option;

                        return (
                          <div
                            key={option}
                            className={`p-2 rounded mb-1 border dark:text-white/90 ${
                              isSelected
                                ? "bg-green-300 dark:bg-green-700"
                                : "bg-gray-100 dark:bg-gray-800"
                            }`}
                          >
                            {option}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {exercise.type === "true_false" &&
                    exercise.true_false_options && (
                      <div className="mt-6">
                        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
                          Proposições
                        </h3>
                        {exercise.true_false_options.map((alternative, i) => {
                          const char = answer[i];

                          return (
                            <div
                              key={alternative._id}
                              className="mt-2 p-2 rounded border border-gray-300 dark:border-gray-700 flex items-center justify-between bg-gray-100 dark:bg-gray-800"
                            >
                              <p className="text-lg font-medium text-gray-800 dark:text-white/90">
                                {alternative.statement}
                              </p>
                              <span
                                className={`ml-4 font-semibold ${
                                  char === "V"
                                    ? "text-green-600"
                                    : char === "F"
                                    ? "text-red-600"
                                    : ""
                                }`}
                              >
                                {char === "V"
                                  ? "Verdadeiro"
                                  : char === "F"
                                  ? "Falso"
                                  : ""}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                </div>
              );
            })}
            <div className="mb-4 flex justify-between items-center">
              <div className="flex flex-col w-full mr-4">
                <label
                  htmlFor="grade"
                  className="block font-medium mb-2 dark:text-white/90"
                >
                  Nota para {selectedStudentName}
                </label>
                <Input
                  id="grade"
                  type="number"
                  min="0"
                  max="10"
                  step={0.1}
                  defaultValue={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 !w-32 dark:text-white/90"
                  placeholder="Ex: 8.5"
                  required
                  disabled={!isEditing}
                />
              </div>

              <div>
                {!isEditing ? (
                  <button
                    onClick={handleEditClick}
                    className="flex h-10 min-w-[84px] items-center justify-center overflow-hidden rounded-lg bg-yellow-500 hover:bg-yellow-600 px-4 text-sm font-bold leading-normal tracking-wide text-white"
                  >
                    <span className="truncate">Editar Nota</span>
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitGrade}
                    className="flex h-10 min-w-[84px] items-center justify-center overflow-hidden rounded-lg bg-[#0c77f2] px-4 text-sm font-bold leading-normal tracking-wide text-white"
                  >
                    <span className="truncate">Enviar Nota</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ExerciseListCorrectionPage;
