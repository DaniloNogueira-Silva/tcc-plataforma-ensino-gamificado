"use client";

import { useParams } from "next/navigation";
import LessonList from "@/components/lesson/LessonList";
import ExerciseList from "@/components/exercise/ExerciseList";
import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { HttpRequest } from "@/utils/http-request";
import { ILesson } from "@/utils/interfaces/lesson.interface";
import { IExercise } from "@/utils/interfaces/exercise.interface";

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

  const httpRequest = new HttpRequest();

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
      await httpRequest.updateLesson(
        lesson._id,
        lesson.name,
        dueDate,
        lesson.content || "",
        lesson.links || "",
        points,
        lesson.type || "",
        grade,
        lessonPlanId
      );
    } else {
      const exercise = item as IExercise;
      await httpRequest.updateExercise(
        exercise._id,
        exercise.statement || "",
        exercise.type || "",
        exercise.answer || "",
        exercise.showAnswer || false,
        exercise.options || [],
        lessonPlanId,
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
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold dark:text-white/90">
          Detalhes do Plano de Aula
        </h1>

        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Adicionar
        </button>
      </div>

      <section>
        <LessonList lessonPlanId={lessonPlanId} />
        <ExerciseList lessonPlanId={lessonPlanId} />
      </section>

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
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Aulas
              </button>
              <button
                onClick={() => handleChoose("exercise")}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Exercícios
              </button>
            </div>
            <button
              onClick={closeAddModal}
              className="mt-6 text-sm text-gray-600 hover:underline"
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
                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
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
            {availableExercises.length === 0 && <p>Carregando exercícios...</p>}
            <ul className="max-h-60 overflow-auto divide-y divide-gray-200 dark:divide-gray-700">
              {availableExercises.map((exercise) => (
                <li
                  key={exercise._id}
                  className="flex justify-between items-center py-3"
                >
                  <span className="text-gray-900 dark:text-white">
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
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="p-2 border rounded"
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
              Configurar Exercício: {selectedExercise.statement}
            </h4>

            <div className="flex flex-col space-y-2">
              <label className="text-sm">Data de entrega</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="p-2 border rounded"
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
                onClick={() => setSelectedExercise(null)}
              >
                Cancelar
              </button>
              <button onClick={handleSave}>Salvar</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
