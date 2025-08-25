"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useIndividualExerciseData } from "./useCorrectionExerciseData";
import { HttpRequest } from "@/utils/http-request";
import Notification from "@/components/ui/notification/Notification";
import LessonPlanBreadcrumb from "@/components/ui/breadcrumb/LessonPlanBreadCrumb";
import StudentListSidebar from "@/components/correction/StudentListSidebar";
import SummarySidebar from "@/components/correction/SummarySidebar";
import IndividualCorrectionPanel from "@/components/correction/IndividualCorrectionPanel";
const ExerciseCorrectionPage = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const lessonPlanIdFromUrl = searchParams.get("lessonPlanId");
  const exerciseId = params.id as string;

  const {
    studentsAnswers,
    setStudentsAnswers,
    exercise,
    lessonPlanInfo,
    isLoading,
    error,
  } = useIndividualExerciseData(exerciseId, lessonPlanIdFromUrl);

  const [selectedStudentIndex, setSelectedStudentIndex] = useState(0);
  const [grade, setGrade] = useState("0");
  const [isEditingMode, setIsEditingMode] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);

  useEffect(() => {
    if (!studentsAnswers || studentsAnswers.length === 0) return;
    const student = studentsAnswers[selectedStudentIndex];
    if (!student) return;

    const isGraded = student.final_grade != null;
    setIsEditingMode(!isGraded);
    setGrade(isGraded ? String(student.final_grade).replace(".", ",") : "0");
  }, [selectedStudentIndex, studentsAnswers]);

  const handleSubmit = async (goToNext = false) => {
    if (!exercise) return;
    setIsSubmitting(true);
    const httpRequest = new HttpRequest();
    const studentAnswer = studentsAnswers[selectedStudentIndex];
    const numericGrade = parseFloat(grade.replace(",", ".")) || 0;

    try {
      await httpRequest.teacherCorretion(
        exerciseId,
        studentAnswer.user_id._id,
        numericGrade,
        exercise.grade
      );

      const updatedStudents = [...studentsAnswers];
      updatedStudents[selectedStudentIndex] = {
        ...studentAnswer,
        final_grade: numericGrade,
      };
      setStudentsAnswers(updatedStudents);
      console.log(updatedStudents);
      console.log(studentsAnswers);
      setIsEditingMode(false);
      setShowSuccessNotification(true);
      setTimeout(() => setShowSuccessNotification(false), 3000);

      if (goToNext && selectedStudentIndex < studentsAnswers.length - 1) {
        setSelectedStudentIndex((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Erro ao salvar nota", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="p-6">Carregando...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  const selectedStudent = studentsAnswers[selectedStudentIndex];
  if (!exercise || !selectedStudent)
    return <div className="p-6">Nenhum aluno respondeu.</div>;

  const totalStudentsCount = studentsAnswers.length;
  const correctedStudentsCount = studentsAnswers.filter(
    (student) => student.final_grade != null
  ).length;

  const handleGradeChangeWithValidation = (value: string) => {
    const maxGrade = exercise?.grade ?? 0;

    if (value === "" || value === "," || value === ".") {
      setGrade(value);
      return;
    }

    const numericValue = parseFloat(value.replace(",", "."));

    if (isNaN(numericValue)) {
      return;
    }

    if (numericValue >= 0 && numericValue <= maxGrade) {
      setGrade(value); 
    }
  };
  return (
    <>
      {showSuccessNotification && (
        <Notification variant="success" title="Nota salva!" />
      )}
      <div className="p-6 flex flex-col gap-6 bg-[#f9fafb] h-full">
        <LessonPlanBreadcrumb
          lessonPlanId={lessonPlanInfo.id}
          lessonPlanName={lessonPlanInfo.name}
          currentName={exercise.statement}
        />
        <div className="flex flex-1 gap-6 overflow-hidden">
          <StudentListSidebar
            students={studentsAnswers}
            selectedStudentIndex={selectedStudentIndex}
            onSelectStudent={(index) => setSelectedStudentIndex(index)}
            isIndividual={true}
          />
          <IndividualCorrectionPanel
            exercise={exercise}
            studentAnswer={selectedStudent.answer || ""}
          />
          <SummarySidebar
            student={selectedStudent}
            currentTotalGrade={parseFloat(grade.replace(",", ".")) || 0}
            totalPoints={exercise.grade}
            isEditingMode={isEditingMode}
            isSubmitting={isSubmitting}
            onEdit={() => setIsEditingMode(true)}
            onSubmit={handleSubmit}
            totalStudentsCount={totalStudentsCount}
            correctedStudentsCount={correctedStudentsCount}
            grade={grade}
            onGradeChange={handleGradeChangeWithValidation}
          />
        </div>
      </div>
    </>
  );
};

export default ExerciseCorrectionPage;
