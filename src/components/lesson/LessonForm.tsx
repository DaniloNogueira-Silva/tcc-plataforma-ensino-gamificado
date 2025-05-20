"use client";

import { useEffect, useState } from "react";
import { HttpRequest } from "@/utils/http-request";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { jwtDecode } from "jwt-decode";
import { ILessonPlanByRole } from "@/utils/interfaces/lesson-plan.interface";
import { ILesson } from "@/utils/interfaces/lesson.interface";
import { Tooltip } from "../ui/tooltip/Tooltip";
import { HelpCircle } from "lucide-react";


interface TokenPayload {
  _id: string;
  email?: string;
  exp?: number;
  iat?: number;
}

interface FormProps {
  initialData?: ILesson;
  reloadOnSubmit: boolean;
  onCreated?: (lessonId: string) => void;
  onClose: () => void;
}

const LessonForm = ({
  initialData,
  onCreated,
  onClose,
  reloadOnSubmit = true,
}: FormProps) => {
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [points, setPoints] = useState(0);
  const [dueDate, setDueDate] = useState("");
  const [links, setLinks] = useState("");
  const [type, setType] = useState("");
  const [grade, setGrade] = useState(0);
  const [lessonPlans, setLessonPlans] = useState<ILessonPlanByRole[]>([]); 
  const [selectedLessonPlan, setSelectedLessonPlan] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [teacherId, setTeacherId] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      const formattedDueDate = initialData.due_date 
      ? new Date(initialData.due_date).toISOString().split('T')[0] // Formato yyyy-MM-dd
      : "";
      setName(initialData.name || "");
      setContent(initialData.content || "");
      setPoints(initialData.points || 0);
      setDueDate(formattedDueDate);
      setLinks(initialData.links || "");
      setType(initialData.type || "");
      setGrade(initialData.grade || 0);
      setSelectedLessonPlan(initialData.lesson_plan_id || "");
    }

    const fetchLessonPlans = async () => {
      const httpRequest = new HttpRequest();
      const plans = await httpRequest.getLessonPlansByRole();
      setLessonPlans(plans);
    };

    fetchLessonPlans();
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    if (!teacherId) {
      console.error("Erro ao encontrar Id do professor:");
      setLoading(false);
      return;
    }

    try {
      const httpRequest = new HttpRequest();
      let createdLesson;
      if (initialData?._id) {
        createdLesson = await httpRequest.updateLesson(
          initialData._id,
          name,
          dueDate,
          content,
          links,
          points,
          type,
          grade,
          selectedLessonPlan
        );
      } else {
        createdLesson = await httpRequest.createLesson(
          name,
          dueDate,
          content,
          links,
          points,
          type,
          grade,
          teacherId,
          selectedLessonPlan
        );
      }

      if (onCreated && createdLesson?._id) {
        onCreated(createdLesson._id);
      }

      onClose();

      if (reloadOnSubmit) {
        setTimeout(() => window.location.reload(), 500);
      }
    } catch (error) {
      console.error("Erro ao salvar aula:", error);
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
        {initialData?._id ? "Editar Aula" : "Criar Nova Aula"}
      </h4>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
          <div className="col-span-1">
            <Label>Nome*</Label>
            <Input
              type="text"
              placeholder="Digite o nome da aula"
              defaultValue={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="col-span-1">
            <Label>Conteúdo*</Label>
            <Input
              type="text"
              placeholder="Digite o conteúdo da aula"
              defaultValue={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div className="col-span-1">
            <Label>Pontos*</Label>
            <Input
              type="number"
              placeholder="Digite os pontos da aula"
              defaultValue={points}
              onChange={(e) => setPoints(Number(e.target.value))}
            />
          </div>

          <div className="col-span-1">
            <Label>Data de Entrega*</Label>
            <Input
              type="date"
              placeholder="Digite a data de entrega"
              defaultValue={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="col-span-1">
            <Label>Links</Label>
            <Input
              type="text"
              placeholder="Digite links relacionados à aula"
              defaultValue={links}
              onChange={(e) => setLinks(e.target.value)}
            />
          </div>

          <div className="col-span-1">
            <Label>Tipo de Aula*</Label>
            <Input
              type="text"
              placeholder="Tipo de aula"
              defaultValue={type}
              onChange={(e) => setType(e.target.value)}
            />
          </div>

          <div className="col-span-1">
            <Label>Nota*</Label>
            <Input
              type="number"
              placeholder="Digite a nota da aula"
              defaultValue={grade}
              onChange={(e) => setGrade(Number(e.target.value))}
            />
          </div>

          <div className="col-span-1">
            <span className="text-sm font-medium text-gray-800 dark:text-white">
              Plano de Aula*
            </span>
            <Tooltip position="right" width="330px" content="Isso define a qual plano de aula o exercício será atribuído. Pode ser deixado em branco, se preferir não vincular a nenhum.">
              <HelpCircle className="w-4 h-4 text-blue-600 cursor-help" />
            </Tooltip>
            <select
              id="lesson_plan_id"
              value={selectedLessonPlan}
              onChange={(e) => setSelectedLessonPlan(e.target.value)}
              className="mb-3 w-full rounded-md border border-gray-300 p-2 dark:bg-navy-700 dark:text-white"
            >
              <option value="">Selecione um plano de aula</option>
              {lessonPlans.map((plan) => (
                <option key={plan.lessonplan._id} value={plan.lessonplan._id}>
                  {plan.lessonplan.name}
                </option>
              ))}
            </select>
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
              ? "Editar Aula"
              : "Criar Aula"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default LessonForm;
