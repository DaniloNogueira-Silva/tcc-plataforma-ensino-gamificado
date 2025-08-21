import { IExercise } from "@/utils/interfaces/exercise.interface";
import QuestionRenderer from "./QuestionRenderer";

type Props = {
  exercise: IExercise;
  studentAnswer: string;
};

const IndividualCorrectionPanel = ({ exercise, studentAnswer }: Props) => {
  return (
    <main className="flex-1 p-8 flex flex-col gap-6 bg-transparent">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="font-bold text-lg text-gray-800 mb-2">Enunciado</h3>
        <p className="text-gray-600 whitespace-pre-line">
          {exercise.statement}
        </p>
      </div>
      <QuestionRenderer exercise={exercise} studentAnswer={studentAnswer} />
    </main>
  );
};

export default IndividualCorrectionPanel;
