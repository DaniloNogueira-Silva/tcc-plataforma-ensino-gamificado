"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Label from "@/components/form/Label";
import MultiSelect from "@/components/form/MultiSelect";
import Button from "@/components/ui/button/Button";
import { HttpRequest } from "@/utils/http-request";
import { IExercise } from "@/utils/interfaces/exercise.interface";
import { ILessonPlanByRole } from "@/utils/interfaces/lesson-plan.interface";
import { jwtDecode } from "jwt-decode";
import { ClipboardType, FileText, ListChecks } from "lucide-react"; // Ícones importados

interface TokenPayload {
  _id: string;
  email?: string;
  exp?: number;
  iat?: number;
}

const ExerciseListForm = () => {
  const router = useRouter();

  const [name, setName] = useState("");
  const [content, setContent] = useState("");

  const [exercises, setExercises] = useState<IExercise[]>([]);
  const [lessonPlans, setLessonPlans] = useState<ILessonPlanByRole[]>([]);
  const [exercisesIds, setExercisesIds] = useState<string[]>([]);
  const [lessonPlanIds, setLessonPlanIds] = useState<string[]>([]);
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const httpRequest = new HttpRequest();

  useEffect(() => {
    const fetchData = async () => {
      const [foundExercises, foundLessonPlans] = await Promise.all([
        httpRequest.getAllExercises(),
        httpRequest.getLessonPlansByRole(),
      ]);
      setExercises(foundExercises);
      setLessonPlans(foundLessonPlans);
    };
    fetchData();
  }, []);

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

  const exerciseOptions = exercises.map((ex) => ({
    value: ex._id,
    text: ex.statement,
    selected: exercisesIds.includes(ex._id),
  }));

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
      const created = await httpRequest.createExerciseList(
        name,
        content,
        teacherId,
        exercisesIds,
        lessonPlanIds.length ? lessonPlanIds : undefined,
        "exercise_list"
      );

      if (created?._id) {
        router.push("/exercise");
      }
    } catch (error) {
      console.error("Erro ao salvar lista de exercícios:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
        Criar Lista de Exercício
      </h4>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
          <div className="col-span-1">
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
            />
          </div>

          <div className="col-span-2">
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

          <div className="col-span-1">
            <Label>
              <div className="flex items-center gap-2">
                <ListChecks className="w-4 h-4" />
                <span>Exercícios*</span>
              </div>
            </Label>
            <MultiSelect
              options={exerciseOptions}
              defaultSelected={exercisesIds}
              onChange={(selected) => setExercisesIds(selected)}
              disabled={saving}
            />
          </div>
        </div>

        <div className="flex items-center justify-end w-full gap-3 mt-6">
          <Button size="sm" variant="outline" onClick={handleClose}>
            Fechar
          </Button>
          <Button size="sm" type="submit" disabled={saving}>
            {saving ? "Salvando..." : "Criar Lista"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ExerciseListForm;
