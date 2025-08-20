import { StudentAnswer } from "@/app/(admin)/(home)/exercise_list/correction/[id]/page";
import StudentInfoCard from "./StudentInfoCard";
import CorrectionProgressCard from "./CorrectionProgressCard";
import CurrentGradeCard from "./CurrentGradeCard";
import ActionButtons from "./ActionButtons";

type Props = {
  student: StudentAnswer;
  currentTotalGrade: number;
  totalPoints: number;
  isEditingMode: boolean;
  isSubmitting: boolean;
  onEdit: () => void;
  onSubmit: (goToNext?: boolean) => void;
};

const SummarySidebar = (props: Props) => {
  const { student, currentTotalGrade, totalPoints, isEditingMode } = props;
  const isGraded = student.final_grade != null;

  return (
    <aside className="w-[350px] bg-white border-l border-gray-200 p-6 flex flex-col space-y-6">
      <StudentInfoCard student={student} isEditingMode={isEditingMode} />

      <CorrectionProgressCard totalQuestions={student.attempts.length} />
      <CurrentGradeCard
        currentTotalGrade={currentTotalGrade}
        totalPoints={totalPoints}
      />
      <ActionButtons isGraded={isGraded} {...props} />
    </aside>
  );
};

export default SummarySidebar;
