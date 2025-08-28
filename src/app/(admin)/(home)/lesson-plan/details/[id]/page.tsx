"use client";

import { useParams } from "next/navigation";
import LessonList from "@/components/lesson/LessonList";
import ExerciseList from "@/components/exercise/ExerciseList";
import ListOfExerciseList from "@/components/exercise-list/ListOfExerciseList";
import { useState, useEffect, useMemo } from "react";
import { Modal } from "@/components/ui/modal";
import { HttpRequest } from "@/utils/http-request";
import { ILesson } from "@/utils/interfaces/lesson.interface";
import { IExercise } from "@/utils/interfaces/exercise.interface";
import { IExerciseList } from "@/utils/interfaces/exercise_list.interface";
import DatePicker from "@/components/form/date-picker";
import RankingList from "@/components/ranking/RankingList";
import { ChevronDownIcon, ChevronUpIcon } from "@/icons";

export default function DetailsPage() {
  const params = useParams();
  const lessonPlanId = params.id as string;

  const [showAddModal, setShowAddModal] = useState(false);
  const [addMode, setAddMode] = useState<
    "lesson" | "exercise" | "exerciseList" | null
  >(null);
  const [availableLessons, setAvailableLessons] = useState<ILesson[]>([]);
  const [availableExercises, setAvailableExercises] = useState<IExercise[]>([]);
  const [availableExerciseLists, setAvailableExerciseLists] = useState<
    IExerciseList[]
  >([]);
  const [expandedLists, setExpandedLists] = useState<string[]>([]);

  const [selectedItem, setSelectedItem] = useState<{
    item: ILesson | IExercise | IExerciseList;
    type: "school_work" | "exercise_list" | "exercise";
  } | null>(null);

  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [userType, setUserType] = useState<string>("");
  const [activeTab, setActiveTab] = useState<
    "lessons" | "exercises" | "ranking"
  >("lessons");

  const httpRequest = useMemo(() => new HttpRequest(), []);

  useEffect(() => {
    const fetchRole = async () => {
      const result = await httpRequest.getUserByRole();
      setUserType(result.role);
    };

    fetchRole();
  }, [httpRequest]);

  if (!lessonPlanId) {
    return <div>Carregando...</div>;
  }

  function openAddModal() {
    setShowAddModal(true);
    setAddMode(null);
    setAvailableLessons([]);
    setAvailableExercises([]);
    setAvailableExerciseLists([]);
    setExpandedLists([]);
  }

  function closeAddModal() {
    setShowAddModal(false);
    setAddMode(null);
    setSelectedItem(null);
  }

  const toggleList = (id: string) => {
    setExpandedLists((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  async function handleChoose(option: "lesson" | "exercise") {
    setAddMode(option);

    if (option === "lesson") {
      const lessons = await httpRequest.getAllLessons();
      setAvailableLessons(lessons);
    } else if (option === "exercise") {
      const [exercises, lists] = await Promise.all([
        httpRequest.getAllExercises(),
        httpRequest.getAllExerciseLists(),
      ]);
      const listsWithExercises = await Promise.all(
        lists.map(async (list: IExerciseList) => {
          const exercisesDetails = await Promise.all(
            list.exercises_ids.map((id) => httpRequest.getExerciseById(id))
          );
          return { ...list, exercises: exercisesDetails };
        })
      );
      setAvailableExercises(exercises);
      setAvailableExerciseLists(listsWithExercises);
    }
  }

  async function handleAddItem(
    type: "lesson" | "exercise" | "exerciseList",
    item: ILesson | IExercise | IExerciseList
  ) {
    try {
      if (type === "lesson" && (item as ILesson).type !== "school_work") {
        await httpRequest.createLessonPlanContent(
          lessonPlanId,
          item._id,
          "lesson"
        );
        setShowAddModal(false);
        window.location.reload();
      } else {
        let contentType: "school_work" | "exercise_list" | "exercise";

        if (type === "lesson") {
          contentType = "school_work";
        } else if (type === "exerciseList") {
          contentType = "exercise_list";
        } else {
          contentType = "exercise";
        }

        setSelectedItem({ item, type: contentType });
        setDueDate(undefined);
        setAddMode(null);
      }
    } catch (error) {
      console.error("Erro ao adicionar item:", error);
    }
  }

  async function handleSave() {
    if (!selectedItem) return;

    try {
      const { item, type } = selectedItem;
      await httpRequest.createLessonPlanContent(
        lessonPlanId,
        item._id,
        type,
        dueDate
      );

      setSelectedItem(null);
      setShowAddModal(false);
      window.location.reload();
    } catch (error) {
      console.error("Erro ao salvar item no plano de aula:", error);
    }
  }

  const renderConfigurationModal = () => {
    if (!selectedItem) return null;

    const { item } = selectedItem;
    const title =
      "name" in item
        ? item.name
        : "statement" in item
        ? item.statement
        : "Configurar item";

    return (
      <div className="mt-6 space-y-4">
        <h4 className="text-lg font-semibold dark:text-white break-words">
          {title}
        </h4>

        <div className="flex flex-col space-y-2">
          <label className="text-sm">Data de entrega</label>
          <DatePicker
            id="item-due-date-picker"
            onChange={(_, dateStr) => setDueDate(new Date(dateStr))}
          />
        </div>

        <div className="flex justify-end space-x-2 mt-4">
          <button
            className="px-4 py-2 bg-gray-400 rounded"
            onClick={() => setSelectedItem(null)}
          >
            Cancelar
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={handleSave}
          >
            Salvar
          </button>
        </div>
      </div>
    );
  };

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
          <>
            <ListOfExerciseList lessonPlanId={lessonPlanId} />
            <ExerciseList lessonPlanId={lessonPlanId} />
          </>
        )}
        {activeTab === "ranking" && <RankingList lessonPlanId={lessonPlanId} />}
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={closeAddModal}
        className="max-w-[768px] p-5 lg:p-10"
      >
        {!addMode && !selectedItem && (
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
                  <span className="text-gray-900 dark:text-white break-words line-clamp-2">
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
            {availableExerciseLists.length > 0 && (
              <>
                <p className="font-semibold mb-2">Listas</p>
                <ul className="max-h-40 overflow-auto divide-y divide-gray-200 dark:divide-gray-700 mb-4">
                  {availableExerciseLists.map((list) => (
                    <li key={list._id} className="py-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-900 dark:text-white break-words line-clamp-2">
                          {list.name} (Lista)
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleList(list._id)}
                            className="text-gray-500"
                          >
                            {expandedLists.includes(list._id) ? (
                              <ChevronUpIcon />
                            ) : (
                              <ChevronDownIcon />
                            )}
                          </button>
                          <button
                            onClick={() => handleAddItem("exerciseList", list)}
                            className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
                          >
                            Adicionar
                          </button>
                        </div>
                      </div>
                      {expandedLists.includes(list._id) && (
                        <ul className="ml-4 mt-2 list-disc space-y-1">
                          {list.exercises?.map((ex) => (
                            <li
                              key={ex._id}
                              className="text-sm text-gray-700 dark:text-gray-300 break-words line-clamp-2"
                            >
                              {ex.statement}
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}
            {availableExercises.length === 0 &&
              availableExerciseLists.length === 0}
            <ul className="max-h-60 overflow-auto divide-y divide-gray-200 dark:divide-gray-700">
              {availableExercises.map((exercise) => (
                <li
                  key={exercise._id}
                  className="flex justify-between items-center py-3"
                >
                  <span className="text-gray-900 dark:text-white break-words line-clamp-2">
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

        {selectedItem && renderConfigurationModal()}
      </Modal>
    </div>
  );
}
