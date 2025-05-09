"use client";

import { useEffect, useState, useRef } from "react";
import { HttpRequest } from "@/utils/http-request";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { jwtDecode } from "jwt-decode";

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

interface FormProps {
  initialData?: any;
  reloadOnSubmit: boolean;
  onCreated?: (exerciseId: string) => void;
  onClose: () => void;
}

const ExerciseForm = ({
  initialData,
  onCreated,
  onClose,
  reloadOnSubmit = true,
}: FormProps) => {
  const [statement, setStatement] = useState("");
  const [type, setType] = useState<"open" | "multiple_choice" | "true_false">(
    "open"
  );
  const [answer, setAnswer] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [teacherId, setTeacherId] = useState<string | null>(null);

  const [options, setOptions] = useState<string[]>(["", "", "", ""]);
  const [trueFalseStatements, setTrueFalseStatements] = useState<TrueFalseStatement[]>(
    [{ statement: "", answer: "true" }]
  );

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialData) {
      setStatement(initialData.statement || "");
      setType(initialData.type || "open");
      setAnswer(initialData.answer || "");
      setShowAnswer(initialData.showAnswer || false);

      if (initialData.type === "multiple_choice") {
        if (Array.isArray(initialData.options) && initialData.options.length > 0) {
          setOptions(initialData.options);
        } else {
          setOptions([""]);
        }
      } else if (initialData.type === "true_false") {
        if (Array.isArray(initialData.options) && initialData.options.length > 0) {
          const tfArray = initialData.options.map((opt: any) => ({
            statement: opt.statement,
            answer: opt.answer ? "true" : "false",
          }));
          setTrueFalseStatements(tfArray);
        } else {
          setTrueFalseStatements([{ statement: "", answer: "true" }]);
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

  const addMultipleChoiceOption = () => {
    setOptions((prev) => [...prev, ""]);
  };

  const removeMultipleChoiceOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const addTrueFalseStatement = () => {
    setTrueFalseStatements((prev) => [
      ...prev,
      { statement: "", answer: "true" },
    ]);
  };

  const removeTrueFalseStatement = (index: number) => {
    setTrueFalseStatements((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    if (!teacherId) {
      console.error("Erro ao encontrar Id do professor:");
      setLoading(false);
      return;
    }

    try {
      let finalOptions: any[] | string[] = [];
      if (type === "multiple_choice") {
        finalOptions = options;
      } else if (type === "true_false") {
        finalOptions = trueFalseStatements.map((tf) => ({
          statement: tf.statement,
          answer: tf.answer === "true",
        }));
      }

      const httpRequest = new HttpRequest();
      let createdExercise;
      if (initialData?._id) {
        createdExercise = await httpRequest.updateExercise(
          initialData._id,
          statement,
          type,
          answer,
          showAnswer,
          finalOptions
        );
      } else {
        createdExercise = await httpRequest.createExercise(
          statement,
          type,
          answer,
          showAnswer,
          teacherId,
          finalOptions
        );
      }

      if (onCreated && createdExercise?._id) {
        onCreated(createdExercise._id);
      }

      onClose();

      if (reloadOnSubmit) {
        setTimeout(() => window.location.reload(), 500);
      }
    } catch (error) {
      console.error("Erro ao salvar exercício:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      className="max-w-[584px] p-5 lg:p-10"
    >
      <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
        {initialData?._id ? "Editar Exercício" : "Criar Novo Exercício"}
      </h4>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
          <div className="col-span-1">
            <Label>Enunciado*</Label>
            <Input
              type="text"
              placeholder="Digite o enunciado da questão"
              defaultValue={statement}
              onChange={(e) => setStatement(e.target.value)}
            />
          </div>

          <div className="col-span-1">
            <Label>Resposta*</Label>
            <Input
              type="text"
              required
              placeholder="Digite a resposta correta"
              defaultValue={answer}
              onChange={(e) => setAnswer(e.target.value)}
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
            <div className="col-span-1">
              <Label>Alternativas*</Label>
              {options.map((option, index) => (
                <div key={index} className="mb-2">
                  <Input
                    type="text"
                    placeholder={`Alternativa ${index + 1}`}
                    defaultValue={option}
                    onChange={(e) => {
                      const updatedOptions = [...options];
                      updatedOptions[index] = e.target.value;
                      setOptions(updatedOptions);
                    }}
                  />
                  {options.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMultipleChoiceOption(index)}
                      className="mt-1 text-sm text-red-500"
                    >
                      Remover
                    </button>
                  )}
                </div>
              ))}
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
            <div className="col-span-1">
              <Label>Afirmações Verdadeiro/Falso*</Label>
              {trueFalseStatements.map((tf, index) => (
                <div key={index} className="mb-2">
                  <Input
                    type="text"
                    required
                    placeholder={`Afirmação ${index + 1}`}
                    defaultValue={tf.statement}
                    onChange={(e) => {
                      const updated = [...trueFalseStatements];
                      updated[index].statement = e.target.value;
                      setTrueFalseStatements(updated);
                    }}
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

          <div className="col-span-1">
            <Label>Mostrar Resposta ao Aluno</Label>
            <input
              type="checkbox"
              required
              checked={showAnswer}
              onChange={(e) => setShowAnswer(e.target.checked)}
              className="mb-3 dark:bg-navy-800 dark:text-white"
            />
          </div>
        </div>

        <div className="flex items-center justify-end w-full gap-3 mt-6">
          <Button size="sm" variant="outline" onClick={onClose}>
            Fechar
          </Button>
          <Button size="sm" type="submit" disabled={loading}>
            {loading
              ? "Salvando..."
              : initialData?._id
              ? "Editar Exercício"
              : "Criar Exercício"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ExerciseForm;
