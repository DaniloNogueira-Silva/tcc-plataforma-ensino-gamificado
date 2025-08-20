import { IExercise } from "@/utils/interfaces/exercise.interface";
import { IExerciseListAttempt } from "@/utils/interfaces/exercise_list_attempt.interface";
import QuestionRenderer from "./QuestionRenderer";
import CorrectionFooter from "./CorrectionFooter";

type Props = {
  exercise: IExercise;
  questionIndex: number;
  totalQuestions: number;
  attempt?: IExerciseListAttempt;
  grade: string;
  isEditingMode: boolean;
  onGradeChange: (exerciseId: string, value: string) => void;
  onNavigate: (direction: "next" | "prev") => void;
};

const CorrectionPanel = ({
  exercise,
  questionIndex,
  totalQuestions,
  attempt,
  ...props
}: Props) => {
  return (
    <main className="flex-1 p-8 flex flex-col bg-[#f9fafb]">
      <div className="bg-white border border-gray-200 rounded-lg p-5 flex justify-between items-center mb-6">
        <span className="font-semibold text-gray-600">
          Questão {questionIndex + 1} de {totalQuestions}
        </span>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h3 className="font-bold text-lg text-gray-800 mb-2">Enunciado</h3>
        <p className="text-gray-600 whitespace-pre-line">
          {exercise.statement}
        </p>
      </div>

      <QuestionRenderer
        exercise={exercise}
        studentAnswer={attempt?.answer || ""}
      />

      <CorrectionFooter
        exercise={exercise}
        isFirst={questionIndex === 0}
        isLast={questionIndex === totalQuestions - 1}
        {...props}
      />
    </main>
  );
};

export default CorrectionPanel;
