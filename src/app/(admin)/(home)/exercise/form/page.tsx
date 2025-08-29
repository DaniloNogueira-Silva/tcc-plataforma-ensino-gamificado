"use client";

import { IExercise, Options } from "@/utils/interfaces/exercise.interface";
import {
  BarChart,
  FileText,
  GraduationCap,
  HelpCircle,
  List,
  ListChecks,
  ToggleRight,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Button from "@/components/ui/button/Button";
import { HttpRequest } from "@/utils/http-request";
import Label from "@/components/form/Label";
import TextArea from "@/components/form/input/TextArea";
import { Tooltip } from "@/components/ui/tooltip/Tooltip";
import { jwtDecode } from "jwt-decode";

export interface TokenPayload {
  _id: string;
  email?: string;
  exp?: number;
  iat?: number;
}

const ExerciseFormPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const exerciseId = searchParams.get("id");

  const [initialData, setInitialData] = useState<IExercise | null>(null);
  const [loading, setLoading] = useState(false);

  const [statement, setStatement] = useState("");
  const [type, setType] = useState<"open" | "multiple_choice" | "true_false">(
    "open"
  );
  const [answer, setAnswer] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [grade, setGrade] = useState(0);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "easy"
  );
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [lessonPlanIds, setLessonPlanIds] = useState<string[]>([]);

  const [mcOptions, setMcOptions] = useState<string[]>(["", "", "", ""]);
  const [correctOptionIndex, setCorrectOptionIndex] = useState<number | null>(
    null
  );

  const [tfOptions, setTfOptions] = useState<Options[]>([
    { statement: "", answer: true },
  ]);

  const [saving, setSaving] = useState(false);

  const httpRequest = useMemo(() => new HttpRequest(), []);

  useEffect(() => {
    if (exerciseId) {
      setLoading(true);
      const fetchData = async () => {
        const exercise = await httpRequest.getExerciseById(exerciseId);
        const associations = await httpRequest.getAssociationsByContent(
          exerciseId,
          "exercise"
        );
        const lessonPlanIds = (
          associations as { lesson_plan_id: string }[]
        ).map((a) => a.lesson_plan_id);
        setInitialData(exercise);
        setLessonPlanIds(lessonPlanIds);
        setLoading(false);
      };
      fetchData();
    }
  }, [exerciseId, httpRequest]);

  useEffect(() => {
    if (initialData) {
      setStatement(initialData.statement || "");
      setType(initialData.type || "open");
      setGrade(initialData.grade || 0);
      setDifficulty(initialData.difficulty || "easy");
      setAnswer(initialData.answer || "");
      setShowAnswer(initialData.showAnswer || false);
      setLessonPlanIds(initialData.lesson_plan_ids || []);

      if (initialData.type === "multiple_choice") {
        if (
          Array.isArray(initialData.multiple_choice_options) &&
          initialData.multiple_choice_options.length > 0
        ) {
          setMcOptions(initialData.multiple_choice_options);
        } else {
          setMcOptions([""]);
        }
        if (initialData.answer) {
          const idx = Number(initialData.answer);
          if (!isNaN(idx)) setCorrectOptionIndex(idx);
          else setCorrectOptionIndex(null);
        }
      } else if (initialData.type === "true_false") {
        if (
          Array.isArray(initialData.true_false_options) &&
          initialData.true_false_options.length > 0
        ) {
          setTfOptions(initialData.true_false_options);
        } else {
          setTfOptions([{ statement: "", answer: true }]);
        }
      }
    }
  }, [initialData]);

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
      let finalAnswer = "";

      if (type === "multiple_choice") {
        if (correctOptionIndex === null) {
          setSaving(false);
          return;
        }
        finalAnswer = String(correctOptionIndex);
      } else if (type === "true_false") {
        finalAnswer = tfOptions.map((opt) => (opt.answer ? "V" : "F")).join("");
      } else {
        finalAnswer = answer;
      }

      let createdExercise;

      if (exerciseId) {
        createdExercise = await httpRequest.updateExercise(
          exerciseId,
          statement,
          type,
          finalAnswer,
          showAnswer,
          type === "multiple_choice" ? mcOptions : undefined,
          type === "true_false" ? tfOptions : undefined,
          lessonPlanIds.length ? lessonPlanIds : undefined,
          grade,
          difficulty
        );
      } else {
        createdExercise = await httpRequest.createExercise(
          statement,
          type,
          finalAnswer,
          showAnswer,
          teacherId,
          difficulty,
          grade,
          type === "multiple_choice" ? mcOptions : undefined,
          type === "true_false" ? tfOptions : undefined,
          lessonPlanIds.length ? lessonPlanIds : undefined
        );
      }

      if (createdExercise?._id) {
        router.push("/exercise");
      }
    } catch (error) {
      console.error("Erro ao salvar exercício:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Carregando exercício...</p>;

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg bg-white p-6 shadow-md dark:bg-navy-800">
        <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
          {exerciseId ? "Editar Exercício" : "Criar Novo Exercício"}
        </h4>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            <div className="col-span-1">
              <Label>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>Enunciado*</span>
                </div>
              </Label>
              <TextArea
                placeholder="Digite o enunciado da questão"
                value={statement}
                onChange={(e) => setStatement(e)}
                rows={3}
              />
            </div>

            <div className="col-span-1">
              <Label>
                <div className="flex items-center gap-2">
                  <List className="h-4 w-4" />
                  <span>Tipo de Questão*</span>
                </div>
              </Label>
              <select
                id="type"
                value={type}
                onChange={(e) =>
                  setType(
                    e.target.value as "open" | "multiple_choice" | "true_false"
                  )
                }
                className="mb-3 w-full rounded-md border border-gray-300 p-2 dark:bg-navy-700 dark:text-white"
              >
                <option value="open">Questão Aberta</option>
                <option value="multiple_choice">Múltipla Escolha</option>
                <option value="true_false">Verdadeiro ou Falso</option>
              </select>
            </div>
          </div>
          {type === "multiple_choice" && (
            <div className="mt-6">
              <Label>
                <div className="flex items-center gap-2">
                  <ListChecks className="h-4 w-4" />
                  <span>Alternativas*</span>
                </div>
              </Label>
              <div className="mb-3 grid grid-cols-2 gap-4">
                {mcOptions.map((option, index) => (
                  <div
                    key={index}
                    className="mb-3 flex flex-col rounded-md border p-3 shadow-sm dark:border-white/10"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <input
                        type="radio"
                        id={`option-${index}`}
                        name="correctOption"
                        checked={correctOptionIndex === index}
                        onChange={() => setCorrectOptionIndex(index)}
                        className="accent-blue-600"
                      />
                      <label
                        htmlFor={`option-${index}`}
                        className="text-sm font-medium text-gray-800 dark:text-white/80"
                      >
                        Marcar como correta
                      </label>
                    </div>

                    <TextArea
                      placeholder={`Texto da Alternativa ${index + 1}`}
                      value={option}
                      onChange={(e) => {
                        const updatedOptions = [...mcOptions];
                        updatedOptions[index] = e;
                        setMcOptions(updatedOptions);
                      }}
                      rows={2}
                    />

                    {mcOptions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newOptions = mcOptions.filter(
                            (_, i) => i !== index
                          );
                          setMcOptions(newOptions);
                          if (correctOptionIndex === index) {
                            setCorrectOptionIndex(null);
                          } else if (
                            correctOptionIndex !== null &&
                            correctOptionIndex > index
                          ) {
                            setCorrectOptionIndex(correctOptionIndex - 1);
                          }
                        }}
                        className="mt-2 self-start text-xs text-red-500 hover:underline"
                      >
                        Remover Alternativa
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setMcOptions([...mcOptions, ""])}
              >
                Adicionar Alternativa
              </Button>
            </div>
          )}

          {type === "true_false" && (
            <div className="mt-6">
              <Label>
                <div className="flex items-center gap-2">
                  <ToggleRight className="h-4 w-4" />
                  <span>Afirmações Verdadeiro/Falso*</span>
                </div>
              </Label>
              <div className="mb-3 grid grid-cols-2 gap-4">
                {tfOptions.map((opt, index) => (
                  <div key={index} className="mb-2 flex flex-col">
                    <TextArea
                      required
                      placeholder={`Afirmação ${index + 1}`}
                      value={opt.statement}
                      onChange={(e) => {
                        const updatedOptions = [...tfOptions];
                        updatedOptions[index].statement = e;
                        setTfOptions(updatedOptions);
                      }}
                      rows={2}
                    />
                    <select
                      value={opt.answer ? "true" : "false"}
                      onChange={(e) => {
                        const updatedOptions = [...tfOptions];
                        updatedOptions[index].answer =
                          e.target.value === "true";
                        setTfOptions(updatedOptions);
                      }}
                      className="mb-2 w-full rounded-md border border-gray-300 p-2 dark:bg-navy-700 dark:text-white"
                    >
                      <option value="true">Verdadeiro</option>
                      <option value="false">Falso</option>
                    </select>
                    {tfOptions.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setTfOptions(tfOptions.filter((_, i) => i !== index))
                        }
                        className="mt-1 text-sm text-red-500"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  setTfOptions([...tfOptions, { statement: "", answer: true }])
                }
              >
                Adicionar Afirmação
              </Button>
            </div>
          )}
          <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            <div className="col-span-1">
              <div className="mb-1 flex items-center gap-2">
                <BarChart className="h-4 w-4" />
                <span className="text-sm font-medium text-gray-800 dark:text-white">
                  Dificuldade*
                </span>
              </div>
              <select
                value={difficulty}
                onChange={(e) =>
                  setDifficulty(e.target.value as "easy" | "medium" | "hard")
                }
                className="mb-3 w-full rounded-md border border-gray-300 p-2 dark:bg-navy-700 dark:text-white"
              >
                <option value="easy">Fácil</option>
                <option value="medium">Médio</option>
                <option value="hard">Difícil</option>
              </select>
            </div>

            <div className="col-span-1">
              <div className="mb-1 flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                <span className="text-sm font-medium text-gray-800 dark:text-white">
                  Nota*
                </span>
                <Tooltip
                  position="right"
                  width="330px"
                  content="Defina a nota atribuída a este exercício. Caso não tenha, deixe 0."
                >
                  <HelpCircle className="h-4 w-4 cursor-help text-blue-600" />
                </Tooltip>
              </div>
              <input
                type="number"
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value))}
                className="w-full rounded-md border border-gray-300 p-2 dark:bg-navy-700 dark:text-white"
                placeholder="Digite a nota"
                min={0}
                required
              />
            </div>
          </div>

          <div className="mt-6 flex w-full items-center justify-end gap-3">
            <Button size="sm" variant="outline" onClick={handleClose}>
              Fechar
            </Button>
            <Button size="sm" type="submit" disabled={saving}>
              {saving
                ? "Salvando..."
                : exerciseId
                ? "Editar Exercício"
                : "Criar Exercício"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExerciseFormPage;
