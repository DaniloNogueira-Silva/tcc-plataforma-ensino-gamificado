import { IExercise } from "@/utils/interfaces/exercise.interface";
import { Check, X } from "lucide-react";

type Props = {
  exercise: IExercise;
  studentAnswer: string;
};

const QuestionRenderer = ({ exercise, studentAnswer }: Props) => {
  const { type, answer: correctAnswer } = exercise;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 flex-grow">
      {(() => {
        switch (type) {
          case "multiple_choice":
            return (
              <>
                <h3 className="font-bold text-lg text-gray-800 mb-4">
                  Alternativas
                </h3>
                <div className="space-y-3">
                  {exercise.multiple_choice_options?.map(
                    (optionText, index) => {
                      const isSelectedByStudent =
                        String(index) === studentAnswer;
                      const isCorrectAnswer = String(index) === correctAnswer;
                      const baseStyle =
                        "flex items-center justify-between p-4 rounded-lg border";
                      let stateStyle = "bg-gray-50";
                      if (isSelectedByStudent && isCorrectAnswer)
                        stateStyle = "bg-green-50 border-green-300";
                      else if (isSelectedByStudent && !isCorrectAnswer)
                        stateStyle = "bg-red-50 border-red-300";
                      else if (isCorrectAnswer)
                        stateStyle = "bg-blue-50 border-blue-300";
                      return (
                        <div
                          key={index}
                          className={`${baseStyle} ${stateStyle}`}
                        >
                          <p className="text-gray-800">{optionText}</p>
                          <div className="flex items-center space-x-3">
                            {isSelectedByStudent && !isCorrectAnswer && (
                              <X size={20} className="text-red-500" />
                            )}
                            {isCorrectAnswer && (
                              <Check size={20} className="text-green-500" />
                            )}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </>
            );

          case "true_false":
            return (
              <>
                <h3 className="font-bold text-lg text-gray-800 mb-4">
                  Proposições
                </h3>
                <div className="space-y-3">
                  {exercise.true_false_options?.map((option, i) => {
                    const studentChoiceChar = studentAnswer[i] || "";
                    const studentAnswerText =
                      studentChoiceChar === "V" ? "Verdadeiro" : "Falso";
                    const correctAnswerText = option.answer
                      ? "Verdadeiro"
                      : "Falso";
                    const isCorrect = studentAnswerText === correctAnswerText;

                    return (
                      <div
                        key={option._id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <p className="text-gray-700">{option.statement}</p>
                        <div className="flex items-center space-x-4">
                          <span
                            className={`font-semibold ${
                              isCorrect ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {studentAnswerText}
                          </span>
                          {isCorrect ? (
                            <Check className="text-green-600" />
                          ) : (
                            <X className="text-red-600" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            );

          case "open":
            return (
              <>
                <h3 className="font-bold text-lg text-gray-800 mb-4">
                  Resposta do Aluno
                </h3>
                <textarea
                  readOnly
                  value={studentAnswer}
                  className="w-full h-40 p-3 border border-gray-200 rounded-lg resize-none bg-gray-50 text-gray-700"
                  placeholder="O aluno não respondeu a esta questão."
                />
              </>
            );

          default:
            return <p>Tipo de questão não suportado.</p>;
        }
      })()}
    </div>
  );
};

export default QuestionRenderer;
