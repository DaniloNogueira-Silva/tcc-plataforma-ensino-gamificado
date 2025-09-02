import { StudentAnswer } from "@/utils/interfaces/correction.types";
import { UserCircle } from "lucide-react";

type Props = {
  student: StudentAnswer;
  isEditingMode: boolean; 
};

const StudentInfoCard = ({ student, isEditingMode }: Props) => {
  const statusText = isEditingMode
    ? "Correção em andamento"
    : "Correção concluída";
  const statusColor = isEditingMode
    ? "text-gray-500"
    : "text-green-600 font-semibold";

  return (
    <div className="flex items-center space-x-3">
      <UserCircle size={40} className="text-gray-400" />
      <div>
        <h3 className="font-bold text-lg text-gray-900">
          {student.user_id.name}
        </h3>
        <p className={`text-sm ${statusColor}`}>{statusText}</p>
      </div>
    </div>
  );
};

export default StudentInfoCard;
