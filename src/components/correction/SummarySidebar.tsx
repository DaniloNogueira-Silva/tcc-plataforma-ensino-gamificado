import ActionButtons from "./ActionButtons";
import CorrectionProgressCard from "./CorrectionProgressCard";
import CurrentGradeCard from "./CurrentGradeCard";
import { StudentAnswer } from "@/utils/interfaces/correction.types";
import StudentInfoCard from "./StudentInfoCard";

type Props = {
  student: StudentAnswer;
  currentTotalGrade: number;
  totalPoints: number;
  isEditingMode: boolean;
  isSubmitting: boolean;
  onEdit: () => void;
  onSubmit: (goToNext?: boolean) => void;
  correctedStudentsCount: number;
  totalStudentsCount: number;
  grade?: string;
  onGradeChange?: (value: string) => void;
};

const SummarySidebar = (props: Props) => {
  const {
    student,
    currentTotalGrade,
    totalPoints,
    correctedStudentsCount,
    totalStudentsCount,
  } = props;
  const isGraded = student.final_grade != null;

  return (
    <aside className="w-[350px] bg-white border-l border-gray-200 p-6 flex flex-col space-y-6">
      <StudentInfoCard student={student} isEditingMode={props.isEditingMode} />

      <CorrectionProgressCard
        title="Progresso da Turma"
        label="Alunos corrigidos"
        totalCount={totalStudentsCount}
        correctedCount={correctedStudentsCount}
      />

      <CurrentGradeCard
        currentTotalGrade={currentTotalGrade}
        totalPoints={totalPoints}
      />
      {props.onGradeChange && (
        <div className="p-4 border border-gray-200 rounded-lg">
          <label
            htmlFor="grade-input"
            className="font-bold text-gray-700 mb-2 block"
          >
            Atribuir Nota
          </label>
          <div className="flex items-center gap-2">
            <input
              id="grade-input"
              type="text"
              value={props.grade}
              onChange={(e) => props.onGradeChange!(e.target.value)}
              className="w-24 p-2 border border-gray-300 rounded-md text-center disabled:bg-gray-100"
              disabled={!props.isEditingMode}
            />
            <span className="text-gray-600">
              / {totalPoints?.toString().replace(".", ",")}
            </span>
          </div>
        </div>
      )}

      <div className="mt-auto">
        <ActionButtons isGraded={isGraded} {...props} />
      </div>
    </aside>
  );
};

export default SummarySidebar;
