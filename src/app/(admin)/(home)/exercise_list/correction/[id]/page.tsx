"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useCorrectionData } from "./useCorrectionData";
import { IExerciseListAttempt } from "@/utils/interfaces/exercise_list_attempt.interface";
import Notification from "@/components/ui/notification/Notification";
import { HttpRequest } from "@/utils/http-request";

import StudentListSidebar from "@/components/exercise-list/StudentListSidebar";
import CorrectionPanel from "@/components/exercise-list/CorrectionPanel";
import SummarySidebar from "@/components/exercise-list/SummarySidebar";
import LessonPlanBreadcrumb from "@/components/ui/breadcrumb/LessonPlanBreadCrumb";

export interface StudentAnswer {
  _id: string;
  user_id: { _id: string; name: string };
  final_grade?: number;
  attempts: IExerciseListAttempt[];
}
export interface ExerciseGradeMap {
  [exerciseId: string]: string;
}

const ExerciseListCorrectionPage = () => {
  const params = useParams();
  const listId = params.id as string;

  const {
    studentsAnswers,
    setStudentsAnswers,
    exerciseList,
    lessonPlanInfo,
    isLoading,
    error,
  } = useCorrectionData(listId);

  // 2. Estados que controlam a UI da página
  const [selectedStudentIndex, setSelectedStudentIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [exerciseGrades, setExerciseGrades] = useState<ExerciseGradeMap>({});
  const [isEditingMode, setIsEditingMode] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);

  // 3. Lógica para carregar notas e modo de edição quando o aluno muda
  useEffect(() => {
    if (!exerciseList || !studentsAnswers || studentsAnswers.length === 0)
      return;
    const student = studentsAnswers[selectedStudentIndex];
    if (!student) return;

    const isGraded = student.final_grade != null;
    setIsEditingMode(!isGraded);

    const initialGrades = exerciseList.exercises?.reduce((acc, exercise) => {
      const attempt = student.attempts.find(
        (a) => a.exercise_id === exercise._id
      );
      const grade = attempt?.grade;
      acc[exercise._id] = grade != null ? String(grade).replace(".", ",") : "0";
      return acc;
    }, {} as ExerciseGradeMap);

    setExerciseGrades(initialGrades || {});
    setCurrentQuestionIndex(0);
  }, [selectedStudentIndex, exerciseList, studentsAnswers]);

  // 4. Funções de Handler que serão passadas como props
  const handleSelectStudent = (index: number) => {
    setSelectedStudentIndex(index);
  };

  const handleNavigateQuestion = (direction: "next" | "prev") => {
    if (direction === "next") {
      setCurrentQuestionIndex((prev) =>
        Math.min(prev + 1, (exerciseList?.exercises?.length || 1) - 1)
      );
    } else {
      setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0));
    }
  };

  const handleGradeChange = (exerciseId: string, value: string) => {
    setExerciseGrades((prev) => ({ ...prev, [exerciseId]: value }));
  };

  const handleSubmit = async (goToNext = false) => {
    if (!exerciseList) return;
    setIsSubmitting(true);
    const httpRequest = new HttpRequest();
    const currentStudent = studentsAnswers[selectedStudentIndex];

    const gradesToSubmit = Object.entries(exerciseGrades)
      .map(([exerciseId, gradeStr]) => {
        const attempt = currentStudent.attempts.find(
          (a) => a.exercise_id === exerciseId
        );
        const grade = parseFloat(gradeStr.replace(",", ".")) || 0;
        return { attemptId: attempt?._id, grade };
      })
      .filter((item) => item.attemptId);

    try {
      await Promise.all(
        gradesToSubmit.map(({ attemptId, grade }) =>
          httpRequest.gradeExerciseListAttempt(attemptId!, grade)
        )
      );

      // Atualiza o estado local para refletir as mudanças sem precisar recarregar a página
      const updatedStudents = [...studentsAnswers];
      const studentToUpdate = updatedStudents[selectedStudentIndex];
      const newAttempts = studentToUpdate.attempts.map((attempt) => {
        const submitted = gradesToSubmit.find(
          (g) => g.attemptId === attempt._id
        );
        return submitted ? { ...attempt, grade: submitted.grade } : attempt;
      });
      const totalEarned = newAttempts.reduce(
        (sum, att) => sum + (att.grade || 0),
        0
      );
      const totalPossible = exerciseList.exercises.reduce(
        (sum, ex) => sum + ex.grade,
        0
      );

      studentToUpdate.attempts = newAttempts;
      studentToUpdate.final_grade =
        totalPossible > 0 ? (totalEarned / totalPossible) * 10 : 0;
      setStudentsAnswers(updatedStudents);

      setIsEditingMode(false);
      setShowSuccessNotification(true);
      setTimeout(() => setShowSuccessNotification(false), 3000);

      if (goToNext && selectedStudentIndex < studentsAnswers.length - 1) {
        setSelectedStudentIndex((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Erro ao salvar notas", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 5. Renderização
  if (isLoading)
    return <div className="p-6">Carregando dados da correção...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  const selectedStudent = studentsAnswers[selectedStudentIndex];
  const currentExercise = exerciseList?.exercises?.[currentQuestionIndex];
  if (!selectedStudent || !currentExercise)
    return <div className="p-6">Nenhum aluno para corrigir.</div>;

  const currentTotalGrade = Object.values(exerciseGrades).reduce(
    (sum, grade) => sum + (parseFloat(grade.replace(",", ".")) || 0),
    0
  );
  const totalPoints = exerciseList.exercises.reduce(
    (sum, ex) => sum + ex.grade,
    0
  );

  return (
    <>
      {showSuccessNotification && (
        <div className="fixed top-24 right-5 z-[9999]">
          <Notification variant="success" title="Notas salvas com sucesso!" />
        </div>
      )}

      <div>
        <LessonPlanBreadcrumb
          lessonPlanId={lessonPlanInfo.id}
          lessonPlanName={lessonPlanInfo.name}
          currentName={exerciseList.name}
        />
      </div>

      <div className="flex h-full bg-[#f9fafb]">
        <StudentListSidebar
          students={studentsAnswers}
          selectedStudentIndex={selectedStudentIndex}
          onSelectStudent={handleSelectStudent}
        />
        <CorrectionPanel
          exercise={currentExercise}
          questionIndex={currentQuestionIndex}
          totalQuestions={exerciseList.exercises.length}
          attempt={selectedStudent.attempts.find(
            (a) => a.exercise_id === currentExercise._id
          )}
          grade={exerciseGrades[currentExercise._id] || "0"}
          isEditingMode={isEditingMode}
          onGradeChange={handleGradeChange}
          onNavigate={handleNavigateQuestion}
        />
        <SummarySidebar
          student={selectedStudent}
          currentTotalGrade={currentTotalGrade}
          totalPoints={totalPoints}
          isEditingMode={isEditingMode}
          isSubmitting={isSubmitting}
          onEdit={() => setIsEditingMode(true)}
          onSubmit={handleSubmit}
        />
      </div>
    </>
  );
};

export default ExerciseListCorrectionPage;
