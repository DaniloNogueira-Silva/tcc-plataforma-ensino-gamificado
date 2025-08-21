import { StudentAnswer } from "@/utils/interfaces/correction.types";
type Props = {
  student: StudentAnswer;
  isSelected: boolean;
  onClick: () => void;
  isIndividual?: boolean;
};

const StudentListItem = ({
  student,
  isSelected,
  onClick,
}: Props) => {
  const isGraded = student.final_grade != null;
  const grade = isGraded
    ? student.final_grade!.toFixed(1).replace(".", ",")
    : "N/A";

  return (
    <div
      onClick={onClick}
      className={`flex justify-between items-center p-4 cursor-pointer border-l-4 ${
        isSelected
          ? "bg-blue-50 border-blue-500"
          : "border-transparent hover:bg-gray-50"
      }`}
    >
      <div className="flex flex-col">
        <span className="font-semibold text-gray-800">
          {student.user_id.name}
        </span>

        {isGraded && (
          <span className="text-sm text-gray-600 font-medium">
            Nota: {grade}
          </span>
        )}
      </div>
      <span
        className={`px-2 py-1 text-xs font-bold rounded-full ${
          isGraded
            ? "bg-green-100 text-green-700"
            : "bg-yellow-100 text-yellow-700"
        }`}
      >
        {isGraded ? "Corrigido" : "Pendente"}
      </span>
    </div>
  );
};

export default StudentListItem;
