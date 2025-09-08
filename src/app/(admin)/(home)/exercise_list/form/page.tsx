"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { HttpRequest } from "@/utils/http-request";
import { IExercise } from "@/utils/interfaces/exercise.interface";
import { IExerciseList } from "@/utils/interfaces/exercise_list.interface";
import { ILessonPlanByRole } from "@/utils/interfaces/lesson-plan.interface";
import { jwtDecode } from "jwt-decode";
import { ClipboardType, FileText } from "lucide-react";
import ExerciseSelector from "@/components/exercise/ExerciseSelector";

interface TokenPayload {
  _id: string;
  email?: string;
  exp?: number;
  iat?: number;
}

const ExerciseListFormContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const listId = searchParams.get("id");

  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [exercises, setExercises] = useState<IExercise[]>([]);
  const [, setLessonPlans] = useState<ILessonPlanByRole[]>([]);
  const [exercisesIds, setExercisesIds] = useState<string[]>([]);
  const [lessonPlanIds] = useState<string[]>([]);
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const httpRequest = useMemo(() => new HttpRequest(), []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [foundExercises, foundLessonPlans] = await Promise.all([
        httpRequest.getAllExercises(),
        httpRequest.getLessonPlansByRole(),
      ]);
      setExercises(foundExercises);
      setLessonPlans(foundLessonPlans);

      if (listId) {
        try {
          const listToEdit: IExerciseList =
            await httpRequest.getExerciseListById(listId);
          setName(listToEdit.name);
          setContent(listToEdit.content || "");

          setExercisesIds(listToEdit.exercises_ids || []);
        } catch (error) {
          console.error("Erro ao buscar lista para edição:", error);
        }
      }
      setLoading(false);
    };

    fetchData();
  }, [httpRequest, listId]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decoded = jwtDecode<TokenPayload>(token);
          setTeacherId(decoded._id);
        } catch (error) {
          console.error("Erro ao decodificar o token:", error);
        }
      }
    }
  }, []);

  const handleClose = () => {
    router.push("/exercise");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    if (!teacherId) {
      console.error("Erro ao encontrar Id do professor:");
      setSaving(false);
      return;
    }

    try {
      if (listId) {
        await httpRequest.updateExerciseListAndLessonPlans(
          listId,
          name,
          content,
          teacherId,
          exercisesIds,
          lessonPlanIds
        );
      } else {
        await httpRequest.createExerciseList(
          name,
          content,
          teacherId,
          exercisesIds,
          lessonPlanIds.length ? lessonPlanIds : undefined,
          "exercise_list"
        );
      }

      router.push("/exercise");
    } catch (error) {
      console.error("Erro ao salvar lista de exercícios:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="bg-gray p-6 rounded-lg">
      <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
        {listId ? "Editar Lista de Exercício" : "Criar Lista de Exercício"}
      </h4>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
          <div className="col-span-1 bg-white p-6 rounded-lg shadow-md mr-6">
            <h5 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Informações Básicas
            </h5>
            <div className="mb-5">
              <Label>
                <div className="flex items-center gap-2">
                  <ClipboardType className="w-4 h-4" />
                  <span>Nome*</span>
                </div>
              </Label>
              <Input
                type="text"
                placeholder="Digite o nome da lista"
                defaultValue={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>Conteúdo</span>
                </div>
              </Label>
              <TextArea
                placeholder="Digite o conteúdo da lista"
                value={content}
                onChange={(e) => setContent(e)}
                rows={3}
              />
            </div>
          </div>

          <div className="col-span-1 bg-white p-6 rounded-lg shadow-md pl-6">
            <h5 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Exercícios*
            </h5>
            <ExerciseSelector
              exercises={exercises}
              selectedExercises={exercisesIds}
              onSelect={setExercisesIds}
              disabled={saving}
            />
          </div>
        </div>

        <div className="flex items-center justify-end w-full gap-3 mt-6">
          <Button size="sm" variant="outline" onClick={handleClose}>
            Fechar
          </Button>
          <Button size="sm" type="submit" disabled={saving}>
            {saving
              ? "Salvando..."
              : listId
              ? "Salvar Alterações"
              : "Criar Lista"}
          </Button>
        </div>
      </form>
    </div>
  );
};
const ExerciseListForm = () => (
  <Suspense fallback={<div>Carregando...</div>}>
    <ExerciseListFormContent />
  </Suspense>
);
export default ExerciseListForm;
