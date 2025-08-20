import { IExercise } from "@/utils/interfaces/exercise.interface";

type Props = {
  exercise: IExercise;
  grade: string;
  isEditingMode: boolean;
  onGradeChange: (exerciseId: string, value: string) => void;
  onNavigate: (direction: "next" | "prev") => void;
  isFirst: boolean;
  isLast: boolean;
};

const CorrectionFooter = ({
  exercise,
  grade,
  isEditingMode,
  onGradeChange,
  onNavigate,
  isFirst,
  isLast,
}: Props) => {
  const handleBlur = (maxGrade: number) => {
    let numericValue = parseFloat(grade.replace(",", "."));
    if (isNaN(numericValue)) return;
    if (numericValue < 0) numericValue = 0;
    if (numericValue > maxGrade) numericValue = maxGrade;
    onGradeChange(exercise._id, numericValue.toString().replace(".", ","));
  };

  return (
    <div className="mt-auto pt-6 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <label
          htmlFor={`grade-${exercise._id}`}
          className="font-bold text-gray-700"
        >
          Nota:
        </label>
        <input
          id={`grade-${exercise._id}`}
          type="text"
          value={grade}
          onChange={(e) => onGradeChange(exercise._id, e.target.value)}
          onBlur={() => handleBlur(exercise.grade)}
          className="w-20 p-2 border border-gray-300 rounded-md text-center disabled:bg-gray-100 disabled:cursor-not-allowed"
          disabled={!isEditingMode}
        />
        <span className="text-gray-600">
          / {exercise.grade.toString().replace(".", ",")}
        </span>
      </div>
      <div className="flex gap-4">
        <button
          onClick={() => onNavigate("prev")}
          disabled={isFirst}
          className="px-6 py-2 bg-white border border-gray-300 rounded-lg font-semibold text-gray-700 disabled:opacity-50"
        >
          Anterior
        </button>
        <button
          onClick={() => onNavigate("next")}
          disabled={isLast}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold disabled:opacity-50"
        >
          Próxima
        </button>
      </div>
    </div>
  );
};

export default CorrectionFooter;
