"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { HttpRequest } from "@/utils/http-request";
import { IExercise } from "@/utils/interfaces/exercise.interface";
import Notification from "@/components/ui/notification/Notification";

type StudentAnswer = {
  user_id: { _id: string; name: string };
  answer: string;
  _id: string;
};

const ExerciseCorrectionPage = () => {
  const params = useParams();
  const exerciseId = params.id as string;

  const [studentsAnswers, setStudentsAnswers] = useState<StudentAnswer[]>([]);
  const [selectedStudentIndex, setSelectedStudentIndex] = useState<number>(0);
  const [exercise, setExercise] = useState<IExercise | null>(null);
  const [grade, setGrade] = useState<string>("");
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);

  const httpRequest = new HttpRequest();

  useEffect(() => {
    async function fetchStudentsAnswers() {
      if (!exerciseId) return;
      const data = await httpRequest.findAllStudentsByExerciseId(exerciseId);
      setStudentsAnswers(data);
      setSelectedStudentIndex(0);
    }
    fetchStudentsAnswers();
  }, [exerciseId]);

  useEffect(() => {
    async function fetchExercise() {
      if (!exerciseId) return;
      const ex = await httpRequest.getExerciseById(exerciseId);
      setExercise(ex);
    }
    fetchExercise();
  }, [exerciseId]);

  if (!exercise || studentsAnswers.length === 0) {
    return <div>Nenhum aluno respondeu</div>;
  }

  const selectedAnswerObj = studentsAnswers[selectedStudentIndex];
  const selectedAnswer = selectedAnswerObj?.answer || "";
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

    const user_id = selectedAnswerObj.user_id._id;

    try {
      await httpRequest.teacherCorretion(
        exerciseId,
        user_id,
        numericGrade,
        100
      );
      setShowSuccessNotification(true);
      setTimeout(() => setShowSuccessNotification(false), 3000);
    } catch (err) {
      console.error("Erro ao enviar nota:", err);
    }
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

      <div className="flex max-w-7xl mx-auto p-6 gap-6">
        <aside className="w-64 border-r border-gray-300 dark:border-gray-700 overflow-y-auto max-h-[80vh]">
          <h2 className="text-xl font-semibold mb-4">Alunos</h2>
          <ul>
            {studentsAnswers.map((student, idx) => (
              <li
                key={student.user_id._id}
                onClick={() => setSelectedStudentIndex(idx)}
                className={`cursor-pointer p-2 rounded ${
                  idx === selectedStudentIndex
                    ? "bg-blue-200 dark:bg-blue-700 font-semibold"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {student.user_id.name}
              </li>
            ))}
          </ul>
        </aside>

        <main className="flex-1 bg-white dark:bg-gray-900 rounded-lg p-6 shadow-lg max-h-[80vh] overflow-y-auto">
          <h1 className="text-2xl font-semibold mb-4">{exercise.statement}</h1>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">
              Resposta de {selectedStudentName}:
            </h3>

            {exercise.type === "open" && (
              <textarea
                readOnly
                value={selectedAnswer}
                className="w-full h-40 p-3 border border-gray-300 rounded resize-none bg-gray-100 dark:bg-gray-800"
              />
            )}

            {exercise.type === "multiple_choice" && (
              <div>
                {exercise.options?.map((option: any) => {
                  const optionText =
                    typeof option === "string"
                      ? option
                      : option.statement || option;
                  const isSelected = selectedAnswer === optionText;

                  return (
                    <div
                      key={typeof option === "string" ? option : option._id}
                      className={`p-2 rounded mb-1 border ${
                        isSelected
                          ? "bg-green-300 dark:bg-green-700"
                          : "bg-gray-100 dark:bg-gray-800"
                      }`}
                    >
                      {optionText}
                    </div>
                  );
                })}
              </div>
            )}

            {exercise.type === "true_false" && exercise.options && (
              <div className="mt-6">
                <h2 className="text-base font-medium text-gray-800 dark:text-white/90">
                  Proposições
                </h2>
                {exercise.options.map((alternative, i) => {
                  const alunoResposta = selectedAnswer[i];

                  return (
                    <div
                      key={alternative._id}
                      className={`mt-2 p-2 rounded border border-gray-300 dark:border-gray-700 flex items-center justify-between bg-gray-100 dark:bg-gray-800`}
                    >
                      <p className="text-lg font-medium text-gray-800 dark:text-white/90">
                        {alternative.statement}
                      </p>
                      <span
                        className={`ml-4 font-semibold ${
                          alunoResposta === "V"
                            ? "text-green-600"
                            : alunoResposta === "F"
                            ? "text-red-600"
                            : ""
                        }`}
                      >
                        {alunoResposta === "V"
                          ? "Verdadeiro"
                          : alunoResposta === "F"
                          ? "Falso"
                          : ""}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="grade" className="block font-medium mb-2">
              Nota para {selectedStudentName}
            </label>
            <input
              id="grade"
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 w-32"
              placeholder="Ex: 8.5"
              required
            />
          </div>

          <button
            onClick={handleSubmitGrade}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded"
          >
            Enviar Nota
          </button>
        </main>
      </div>
    </>
  );
};

export default ExerciseCorrectionPage;
