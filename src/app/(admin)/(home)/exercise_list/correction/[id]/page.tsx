"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useCorrectionData } from "./useCorrectionData";
import Notification from "@/components/ui/notification/Notification";
import { HttpRequest } from "@/utils/http-request";

import StudentListSidebar from "@/components/correction/StudentListSidebar";
import CorrectionPanel from "@/components/correction/CorrectionPanel";
import SummarySidebar from "@/components/correction/SummarySidebar";
import LessonPlanBreadcrumb from "@/components/ui/breadcrumb/LessonPlanBreadCrumb";
import { ExerciseGradeMap } from "@/utils/interfaces/correction.types";
import { IExerciseListAttempt } from "@/utils/interfaces/exercise_list_attempt.interface";

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

  const [selectedStudentIndex, setSelectedStudentIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [exerciseGrades, setExerciseGrades] = useState<ExerciseGradeMap>({});
  const [isEditingMode, setIsEditingMode] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);

  useEffect(() => {
    if (!exerciseList || !studentsAnswers || studentsAnswers.length === 0)
      return;
    const student = studentsAnswers[selectedStudentIndex];
    if (!student) return;

    const isGraded = student.final_grade != null;
    setIsEditingMode(!isGraded);

    const initialGrades = exerciseList.exercises?.reduce((acc, exercise) => {
      const attempt = student.attempts?.find(
        (a: IExerciseListAttempt) => a.exercise_id === exercise._id
      );
      const grade = attempt?.grade;
      acc[exercise._id] = grade != null ? String(grade).replace(".", ",") : "0";
      return acc;
    }, {} as ExerciseGradeMap);

    setExerciseGrades(initialGrades || {});
    setCurrentQuestionIndex(0);
  }, [selectedStudentIndex, exerciseList, studentsAnswers]);

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

  const handleSubmit = async (goToNext = false) => {
    if (!exerciseList?.exercises) return;
    setIsSubmitting(true);
    const httpRequest = new HttpRequest();
    const currentStudent = studentsAnswers[selectedStudentIndex];

    const gradesToSubmit = Object.entries(exerciseGrades)
      .map(([exerciseId, gradeStr]) => {
        const attempt = currentStudent.attempts?.find(
          (a: IExerciseListAttempt) => a.exercise_id === exerciseId
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

      setStudentsAnswers((prevAnswers) => {
        return prevAnswers.map((student, index) => {
          if (index !== selectedStudentIndex) {
            return student;
          }

          const newAttempts = (student.attempts || []).map((attempt) => {
            const submitted = gradesToSubmit.find(
              (g) => g.attemptId === attempt._id
            );
            return submitted ? { ...attempt, grade: submitted.grade } : attempt;
          });

          const totalEarned = newAttempts.reduce(
            (sum, att) => sum + (att.grade || 0),
            0
          );

          const newFinalGrade = totalEarned;

          return {
            ...student,
            attempts: newAttempts,
            final_grade: newFinalGrade,
          };
        });
      });

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
  const totalPoints = exerciseList.exercises?.reduce(
    (sum, ex) => sum + ex.grade,
    0
  );

  const totalStudentsCount = studentsAnswers.length;
  const correctedStudentsCount = studentsAnswers.filter(
    (student) => student.final_grade != null
  ).length;

  const handleGradeChangeWithValidation = (
    exerciseId: string,
    value: string
  ) => {
    const exercise = exerciseList?.exercises?.find(
      (ex) => ex._id === exerciseId
    );
    const maxGrade = exercise?.grade ?? 0;

    if (value === "" || value === "," || value === ".") {
      setExerciseGrades((prev) => ({ ...prev, [exerciseId]: value }));
      return;
    }
    const numericValue = parseFloat(value.replace(",", "."));
    if (isNaN(numericValue)) return;

    if (numericValue >= 0 && numericValue <= maxGrade) {
      setExerciseGrades((prev) => ({ ...prev, [exerciseId]: value }));
    }
  };

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
          totalQuestions={exerciseList.exercises?.length || 0}
          attempt={selectedStudent.attempts?.find(
            (a: IExerciseListAttempt) => a.exercise_id === currentExercise._id
          )}
          grade={exerciseGrades[currentExercise._id] || "0"}
          isEditingMode={isEditingMode}
          onGradeChange={handleGradeChangeWithValidation}
          onNavigate={handleNavigateQuestion}
        />
        <SummarySidebar
          student={selectedStudent}
          currentTotalGrade={currentTotalGrade}
          totalPoints={totalPoints || 0}
          isEditingMode={isEditingMode}
          isSubmitting={isSubmitting}
          onEdit={() => setIsEditingMode(true)}
          onSubmit={handleSubmit}
          totalStudentsCount={totalStudentsCount}
          correctedStudentsCount={correctedStudentsCount}
        />
      </div>
    </>
  );
};

export default ExerciseListCorrectionPage;
