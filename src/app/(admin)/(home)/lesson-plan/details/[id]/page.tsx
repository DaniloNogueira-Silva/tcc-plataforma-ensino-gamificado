"use client";

import { useParams } from "next/navigation";
import LessonList from "@/components/lesson/LessonList";
import ExerciseList from "@/components/exercise/ExerciseList";
import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { HttpRequest } from "@/utils/http-request";
import { ILesson } from "@/utils/interfaces/lesson.interface";
import { IExercise } from "@/utils/interfaces/exercise.interface";
import DatePicker from "@/components/form/date-picker";
import RankingList from "@/components/ranking/RankingList"; // Make sure to create this component

export default function DetailsPage() {
  const params = useParams();
  const lessonPlanId = params.id as string;

  const [showAddModal, setShowAddModal] = useState(false);
  const [addMode, setAddMode] = useState<"lesson" | "exercise" | null>(null);

  const [availableLessons, setAvailableLessons] = useState<ILesson[]>([]);
  const [availableExercises, setAvailableExercises] = useState<IExercise[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<ILesson | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<IExercise | null>(
    null
  );
  const [dueDate, setDueDate] = useState("");
  const [points, setPoints] = useState(0);
  const [grade, setGrade] = useState(0);
  const [userType, setUserType] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"lessons" | "exercises" | "ranking">(
    "lessons"
  );
  const httpRequest = new HttpRequest();

  useEffect(() => {
    const fetchRole = async () => {
      const result = await httpRequest.getUserByRole();
      setUserType(result.role);
    };

    fetchRole();
  }, []);

  if (!lessonPlanId) {
    return <div>Carregando...</div>;
  }

  function openAddModal() {
    setShowAddModal(true);
    setAddMode(null);
    setAvailableLessons([]);
    setAvailableExercises([]);
  }

  function closeAddModal() {
    setShowAddModal(false);
    setAddMode(null);
  }

  async function handleChoose(option: "lesson" | "exercise") {
    setAddMode(option);

    if (option === "lesson") {
      const lessons = await httpRequest.getAllLessons();
      setAvailableLessons(lessons);
    } else if (option === "exercise") {
      const exercises = await httpRequest.getAllExercises();
      setAvailableExercises(exercises);
    }
  }

  async function handleAddItem(
    type: "lesson" | "exercise",
    item: ILesson | IExercise
  ) {
    try {
      if (type === "lesson") {
        const lesson = item as ILesson;

        if (lesson.type === "reading") {
          await updateItem("lesson", lesson);
          setShowAddModal(false);
        } else {
          setSelectedLesson(lesson);
          setDueDate("");
          setPoints(0);
          setGrade(0);
        }
      } else {
        const exercise = item as IExercise;
        setSelectedExercise(exercise);
        setDueDate("");
        setPoints(0);
        setGrade(0);
      }

      setAddMode(null);
    } catch (error) {
      console.error("Erro ao adicionar item:", error);
    }
  }

  async function updateItem(
    type: "lesson" | "exercise",
    item: ILesson | IExercise
  ) {
    if (type === "lesson") {
      const lesson = item as ILesson;
      await httpRequest.updateLessonAndLessonPlans(
        lesson._id,
        lesson.name,
        dueDate,
        lesson.content || "",
        lesson.links || "",
        points,
        lesson.type || "",
        grade,
        [lessonPlanId]
      );
    } else {
      const exercise = item as IExercise;
      await httpRequest.updateExerciseAndLessonPlans(
        exercise._id,
        exercise.statement || "",
        exercise.type || "",
        exercise.answer || "",
        exercise.showAnswer || false,
        exercise.type === "multiple_choice"
          ? exercise.multiple_choice_options
          : undefined,
        exercise.type === "true_false"
          ? exercise.true_false_options
          : undefined,
        [lessonPlanId],
        dueDate,
        points,
        grade
      );
    }
  }

  async function handleSave() {
    if (selectedLesson) {
      await updateItem("lesson", selectedLesson);
      setSelectedLesson(null);
    }

    if (selectedExercise) {
      await updateItem("exercise", selectedExercise);
      setSelectedExercise(null);
    }

    setShowAddModal(false);
  }

  return (
    <div className="px-40 flex flex-1 justify-center py-5">
      <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
        <div className="flex flex-wrap justify-between gap-3 p-4">
          <p className="text-[#121416] tracking-light text-[32px] font-bold leading-tight min-w-72">
            Aulas e Exercícios
          </p>
          {userType !== "STUDENT" && (
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Adicionar
            </button>
          )}
        </div>

        <div className="pb-3">
          <div className="flex border-b border-[#dbe0e6] px-4 gap-8">
            <button
              type="button"
              onClick={() => setActiveTab("lessons")}
              className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 ${
                activeTab === "lessons"
                  ? "border-b-[#111418] text-[#111418]"
                  : "border-b-transparent text-[#60758a]"
              }`}
            >
              <p className="text-sm font-bold leading-normal tracking-[0.015em]">
                Aulas
              </p>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("exercises")}
              className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 ${
                activeTab === "exercises"
                  ? "border-b-[#111418] text-[#111418]"
                  : "border-b-transparent text-[#60758a]"
              }`}
            >
              <p className="text-sm font-bold leading-normal tracking-[0.015em]">
                Exercícios
              </p>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("ranking")}
              className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 ${
                activeTab === "ranking"
                  ? "border-b-[#111418] text-[#111418]"
                  : "border-b-transparent text-[#60758a]"
              }`}
            >
              <p className="text-sm font-bold leading-normal tracking-[0.015em]">
                Ranking de Pontuação
              </p>
            </button>
          </div>
        </div>
        {activeTab === "lessons" && <LessonList lessonPlanId={lessonPlanId} />}
        {activeTab === "exercises" && (
          <ExerciseList lessonPlanId={lessonPlanId} />
        )}
        {activeTab === "ranking" && (
          <RankingList lessonPlanId={lessonPlanId} />
        )}
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={closeAddModal}
        className="max-w-[768px] p-5 lg:p-10"
      >
        {!addMode && !selectedLesson && !selectedExercise && (
          <div>
            <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
              Deseja adicionar aulas ou exercícios?
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleChoose("lesson")}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Aulas
              </button>
              <button
                onClick={() => handleChoose("exercise")}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
              >
                Exercícios
              </button>
            </div>
            <button
              onClick={closeAddModal}
              className="mt-6 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancelar
            </button>
          </div>
        )}

        {addMode === "lesson" && (
          <div>
            <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
              Adicionar Aulas
            </h4>
            {availableLessons.length === 0 && <p>Carregando aulas...</p>}
            <ul className="max-h-60 overflow-auto divide-y divide-gray-200 dark:divide-gray-700">
              {availableLessons.map((lesson) => (
                <li
                  key={lesson._id}
                  className="flex justify-between items-center py-3"
                >
                  <span className="text-gray-900 dark:text-white">
                    {lesson.name || "Sem título"}
                  </span>
                  <button
                    onClick={() => handleAddItem("lesson", lesson)}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                  >
                    Adicionar
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex justify-end mt-6">
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setAddMode(null)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Voltar
                </button>
              </div>
            </div>
          </div>
        )}

        {addMode === "exercise" && (
          <div>
            <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
              Adicionar Exercícios
            </h4>
            {availableExercises.length === 0 && (
              <p>Carregando exercícios...</p>
            )}
            <ul className="max-h-60 overflow-auto divide-y divide-gray-200 dark:divide-gray-700">
              {availableExercises.map((exercise) => (
                <li
                  key={exercise._id}
                  className="flex justify-between items-center py-3"
                >
                  <span className="text-gray-900 dark:text-white line-clamp-1">
                    {exercise.statement || "Sem título"}
                  </span>
                  <button
                    onClick={() => handleAddItem("exercise", exercise)}
                    className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
                  >
                    Adicionar
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex justify-end mt-6">
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setAddMode(null)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Voltar
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedLesson && (
          <div className="mt-6 space-y-4">
            <h4 className="text-lg font-semibold dark:text-white">
              Configurar Aula: {selectedLesson.name}
            </h4>

            <div className="flex flex-col space-y-2">
              <label className="text-sm">Data de entrega</label>
              <DatePicker
                id="lesson-due-date-picker"
                defaultDate={dueDate || undefined}
                onChange={(_, dateStr) => setDueDate(dateStr)}
              />
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-sm">Pontos</label>
              <input
                type="number"
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                className="p-2 border rounded"
              />
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-sm">Nota</label>
              <input
                type="number"
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value))}
                className="p-2 border rounded"
              />
            </div>

            <div className="flex justify-end space-x-2 mt-4">
              <button
                className="px-4 py-2 bg-gray-400 rounded"
                onClick={() => setSelectedLesson(null)}
              >
                Cancelar
              </button>
              <button onClick={handleSave}>Salvar</button>
            </div>
          </div>
        )}

        {selectedExercise && (
          <div className="mt-6 space-y-4">
            <h4 className="text-lg font-semibold dark:text-white">
              Adicionar Exercício: {selectedExercise.statement}
            </h4>

            <div className="flex flex-col space-y-2">
              <label className="text-sm">Data de entrega</label>
              <DatePicker
                id="exercise-due-date-picker"
                defaultDate={dueDate || undefined}
                onChange={(_, dateStr) => setDueDate(dateStr)}
              />
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-sm">Pontos</label>
              <input
                type="number"
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                className="p-2 border rounded"
              />
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-sm">Nota</label>
              <input
                type="number"
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value))}
                className="p-2 border rounded"
              />
            </div>

            <div className="flex justify-end space-x-2 mt-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => setSelectedExercise(null)}
              >
                Cancelar
              </button>
              <button
                className="bg-purple-500 text-white rounded hover:bg-purple-600"
                onClick={handleSave}
              >
                Confirmar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}