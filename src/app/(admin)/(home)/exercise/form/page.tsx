"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Button from "@/components/ui/button/Button";
import { HttpRequest } from "@/utils/http-request";
import { ILessonPlanByRole } from "@/utils/interfaces/lesson-plan.interface";
import Label from "@/components/form/Label";
import { jwtDecode } from "jwt-decode";
import { Tooltip } from "@/components/ui/tooltip/Tooltip";
import { HelpCircle } from "lucide-react";
import TextArea from "@/components/form/input/TextArea";
import { IExercise, Options } from "@/utils/interfaces/exercise.interface";

interface TokenPayload {
  _id: string;
  email?: string;
  exp?: number;
  iat?: number;
}

interface TrueFalseStatement {
  statement: string;
  answer: "true" | "false";
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
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [selectedLessonPlan, setSelectedLessonPlan] = useState("");
  const [lessonPlans, setLessonPlans] = useState<ILessonPlanByRole[]>([]);
  const [options, setOptions] = useState<string[]>(["", "", "", ""]);
  const [trueFalseStatements, setTrueFalseStatements] = useState<
    TrueFalseStatement[]
  >([{ statement: "", answer: "true" }]);
  const [correctOptionIndex, setCorrectOptionIndex] = useState<number | null>(
    null
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (exerciseId) {
      setLoading(true);
      const fetchExercise = async () => {
        const httpRequest = new HttpRequest();
        const exercise = await httpRequest.getExerciseById(exerciseId);
        setInitialData(exercise);
        setLoading(false);
      };
      fetchExercise();
    }
  }, [exerciseId]);

  useEffect(() => {
    if (initialData) {
      setStatement(initialData.statement || "");
      setType(initialData.type || "open");
      setAnswer(initialData.answer || "");
      setShowAnswer(initialData.showAnswer || false);
      setSelectedLessonPlan(initialData.lesson_plan_id || "");

      if (initialData.type === "multiple_choice") {
        if (
          Array.isArray(initialData.options) &&
          initialData.options.length > 0
        ) {
          setOptions(initialData.options);
          if (initialData.answer) {
            const idx = Number(initialData.answer);
            if (!isNaN(idx)) setCorrectOptionIndex(idx);
          }
        } else {
          setOptions([""]);
        }
      } else if (initialData.type === "true_false") {
        if (
          Array.isArray(initialData.options) &&
          initialData.options.length > 0
        ) {
          const truefalseArray = initialData.options.map((opt: Options) => ({
            statement: opt.statement,
            answer: opt.answer ? "true" : "false",
          }));
          setTrueFalseStatements(truefalseArray);
        } else {
          setTrueFalseStatements([{ statement: "", answer: "true" }]);
        }
      }
    }
  }, [initialData]);

  useEffect(() => {
    const fetchLessonPlans = async () => {
      const httpRequest = new HttpRequest();
      const plans = await httpRequest.getLessonPlansByRole();
      setLessonPlans(plans);
    };
    fetchLessonPlans();
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

  const addMultipleChoiceOption = () => setOptions((prev) => [...prev, ""]);
  const removeMultipleChoiceOption = (index: number) =>
    setOptions((prev) => prev.filter((_, i) => i !== index));
  const addTrueFalseStatement = () =>
    setTrueFalseStatements((prev) => [
      ...prev,
      { statement: "", answer: "true" },
    ]);
  const removeTrueFalseStatement = (index: number) =>
    setTrueFalseStatements((prev) => prev.filter((_, i) => i !== index));

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
      let finalOptions: Options[] | string[] = [];
      if (type === "multiple_choice") {
        finalOptions = options;
        if (correctOptionIndex === null) {
          alert("Selecione a alternativa correta.");
          setSaving(false);
          return;
        }
        setAnswer(String(correctOptionIndex));
      } else if (type === "true_false") {
        finalOptions = trueFalseStatements.map((tf) => ({
          statement: tf.statement,
          answer: tf.answer === "true",
        }));
        const tfEncoded = trueFalseStatements.map((tf) =>
          tf.answer === "true" ? "V" : "F"
        );
        setAnswer(tfEncoded.join(""));
      }

      const httpRequest = new HttpRequest();
      let createdExercise;
      if (exerciseId) {
        createdExercise = await httpRequest.updateExercise(
          exerciseId,
          statement,
          type,
          answer,
          showAnswer,
          finalOptions,
          selectedLessonPlan
        );
      } else {
        createdExercise = await httpRequest.createExercise(
          statement,
          type,
          answer,
          showAnswer,
          teacherId,
          finalOptions,
          selectedLessonPlan
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
    <div>
      <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
        {exerciseId ? "Editar Exercício" : "Criar Novo Exercício"}
      </h4>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
          <div className="col-span-1">
            <Label>Enunciado*</Label>
            <TextArea
              placeholder="Digite o enunciado da questão"
              value={statement}
              onChange={(e) => setStatement(e)}
              rows={3}
            />
          </div>

          <div className="col-span-1">
            <Label>Tipo de Questão*</Label>
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

          {type === "multiple_choice" && (
            <div className="col-span-2">
              <Label>Alternativas*</Label>
              <div className="grid grid-cols-2 gap-4 mb-3">
                {options.map((option, index) => (
                  <div
                    key={index}
                    className="mb-3 flex flex-col rounded-md border p-3 shadow-sm dark:border-white/10"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="radio"
                        id={`option-${index}`}
                        name="correctOption"
                        checked={correctOptionIndex === index}
                        onChange={() => setCorrectOptionIndex(index)}
                        className="accent-blue-600"
                        value={answer}
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
                        const updatedOptions = [...options];
                        updatedOptions[index] = e;
                        setOptions(updatedOptions);
                      }}
                      rows={2}
                    />

                    {options.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMultipleChoiceOption(index)}
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
                onClick={addMultipleChoiceOption}
              >
                Adicionar Alternativa
              </Button>
            </div>
          )}

          {type === "true_false" && (
            <div className="col-span-2">
              <Label>Afirmações Verdadeiro/Falso*</Label>
              <div className="grid grid-cols-2 gap-4 mb-3">
                {trueFalseStatements.map((tf, index) => (
                  <div key={index} className="mb-2 flex flex-col">
                    <TextArea
                      required
                      placeholder={`Afirmação ${index + 1}`}
                      value={tf.statement}
                      onChange={(e) => {
                        const updated = [...trueFalseStatements];
                        updated[index].statement = e;
                        setTrueFalseStatements(updated);
                      }}
                      rows={2}
                    />
                    <select
                      value={tf.answer}
                      onChange={(e) => {
                        const updated = [...trueFalseStatements];
                        updated[index].answer = e.target.value as
                          | "true"
                          | "false";
                        setTrueFalseStatements(updated);
                      }}
                      className="mb-2 w-full rounded-md border border-gray-300 p-2 dark:bg-navy-700 dark:text-white"
                    >
                      <option value="true">Verdadeiro</option>
                      <option value="false">Falso</option>
                    </select>
                    {trueFalseStatements.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTrueFalseStatement(index)}
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
                onClick={addTrueFalseStatement}
              >
                Adicionar Afirmação
              </Button>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <input
            type="checkbox"
            checked={showAnswer}
            onChange={(e) => setShowAnswer(e.target.checked)}
            className="dark:bg-navy-800 dark:text-white"
            id="showAnswerCheckbox"
          />
          <label
            htmlFor="showAnswerCheckbox"
            className="text-sm font-medium text-gray-800 dark:text-white cursor-pointer"
          >
            Mostrar Resposta ao Aluno
          </label>
          <Tooltip
            position="right"
            content="Aqui você define se o aluno verá a resposta após responder."
          >
            <HelpCircle className="w-4 h-4 text-blue-600 cursor-help" />
          </Tooltip>
        </div>

        <div className="col-span-1 mt-6">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-sm font-medium text-gray-800 dark:text-white">
              Plano de Aula*
            </span>
            <Tooltip
              position="right"
              width="330px"
              content="Isso define a qual plano de aula o exercício será atribuído. Pode ser deixado em branco, se preferir não vincular a nenhum."
            >
              <HelpCircle className="w-4 h-4 text-blue-600 cursor-help" />
            </Tooltip>
          </div>
          <select
            id="lesson_plan_id"
            onChange={(e) => setSelectedLessonPlan(e.target.value)}
            className="mb-3 w-full rounded-md border border-gray-300 p-2 dark:bg-navy-700 dark:text-white"
            value={selectedLessonPlan}
          >
            <option value="">Selecione um plano de aula</option>
            {lessonPlans.map((plan) => (
              <option key={plan.lessonplan._id} value={plan.lessonplan._id}>
                {plan.lessonplan.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-end w-full gap-3 mt-6">
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
  );
};

export default ExerciseFormPage;
