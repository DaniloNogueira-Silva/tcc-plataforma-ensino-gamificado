"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HttpRequest } from "@/utils/http-request";
import { useParams } from "next/navigation";
import { IExercise } from "@/utils/interfaces/exercise.interface";

const ExerciseDetailsPage = () => {
  const params = useParams();
  const exerciseId = params.id as string;
  const [exercise, setExercise] = useState<IExercise | null>(null);
  const router = useRouter();
  const [selectedAnswer, setSelectedAnswer] = useState<{
    [key: string]: string;
  }>({});

  useEffect(() => {
    const fetchExerciseDetails = async () => {
      if (!exerciseId) return;
      const httpRequest = new HttpRequest();
      const response = await httpRequest.getExerciseById(exerciseId as string);
      setExercise(response);
    };

    fetchExerciseDetails();
  }, [exerciseId]);

  const handleAnswerSubmission = async (e: React.FormEvent) => {
    e.preventDefault();

    const httpRequest = new HttpRequest();
    let answerString = "";

    if (exercise?.type === "true_false") {
      exercise.options?.forEach((alternative) => {
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

    router.back();
  };

  if (!exercise) return <div>Carregando...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white shadow-xl rounded-lg">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">
        {exercise.statement}
      </h1>

      <form onSubmit={handleAnswerSubmission}>
        {/* Exibição para questões de tipo "open" */}
        {exercise.type === "open" && (
          <div className="mt-6">
            <h2 className="text-2xl font-medium">Sua Resposta</h2>
            <textarea
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
            />
          </div>
        )}

        {/* Exibição para questões de tipo "multiple_choice" */}
        {exercise.type === "multiple_choice" && (
          <div className="mt-6">
            <h2 className="text-2xl font-medium">Alternativas</h2>
            <div className="space-y-4 mt-4">
              {exercise.options?.map((option, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 border-b border-gray-300 pb-3"
                >
                  <input
                    type="radio"
                    id={`alternative-${index}`}
                    name={`multiple_choice-${exerciseId}`}
                    value={option}
                    onChange={(e) =>
                      setSelectedAnswer({
                        ...selectedAnswer,
                        [exerciseId]: e.target.value,
                      })
                    }
                    className="h-5 w-5 text-blue-500 border-gray-300 rounded"
                    required
                  />
                  <label
                    htmlFor={`alternative-${index}`}
                    className="text-xl text-gray-700"
                  >
                    {option}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Exibição para questões de tipo "true_false" */}
        {exercise.type === "true_false" && exercise.options && (
          <div className="mt-6">
            <h2 className="text-2xl font-medium">Proposições</h2>
            {exercise.options.map((alternative, index) => (
              <div key={alternative._id} className="mt-4">
                <p className="text-lg text-gray-700">{alternative.statement}</p>
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
                  />
                  <label
                    htmlFor={`true-${alternative._id}`}
                    className="text-lg text-gray-700"
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
                  />
                  <label
                    htmlFor={`false-${alternative._id}`}
                    className="text-lg text-gray-700"
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
          className="mt-6 w-full py-3 bg-blue-500 text-white font-semibold rounded-md shadow-md hover:bg-blue-600"
        >
          Confirmar Resposta
        </button>
      </form>
    </div>
  );
};

export default ExerciseDetailsPage;
