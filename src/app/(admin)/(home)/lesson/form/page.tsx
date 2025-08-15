"use client";

import { useEffect, useState } from "react";
import { HttpRequest } from "@/utils/http-request";
import Input from "@/components/form/input/InputField";
import FileInput from "@/components/form/input/FileInput";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { jwtDecode } from "jwt-decode";
import { ILessonPlanByRole } from "@/utils/interfaces/lesson-plan.interface";
import { ILesson } from "@/utils/interfaces/lesson.interface";
import { Tooltip } from "@/components/ui/tooltip/Tooltip";
import { HelpCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import TextArea from "@/components/form/input/TextArea";
import MultiSelect from "@/components/form/MultiSelect";

interface TokenPayload {
  _id: string;
  email?: string;
  exp?: number;
  iat?: number;
}

const LessonForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lessonId = searchParams.get("id");

  const [initialData, setInitialData] = useState<ILesson | null>(null);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [links, setLinks] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState("");
  const [grade, setGrade] = useState(0);
  const [lessonPlanIds, setLessonPlanIds] = useState<string[]>([]);
  const [lessonPlans, setLessonPlans] = useState<ILessonPlanByRole[]>([]);
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const options = lessonPlans.map((plan) => ({
    value: plan.lessonplan._id,
    text: plan.lessonplan.name,
    selected: lessonPlanIds.includes(plan.lessonplan._id),
  }));

  useEffect(() => {
    if (lessonId) {
      setLoading(true);
      const fetchLesson = async () => {
        const httpRequest = new HttpRequest();
        const lesson = await httpRequest.getLessonById(lessonId);
        const associations = await httpRequest.getAssociationsByContent(
          lessonId,
          "lesson"
        );
        const lessonPlanIds = associations.map(
          (a: { lesson_plan_id: string }) => a.lesson_plan_id
        );
        setInitialData(lesson);
        setLessonPlanIds(lessonPlanIds);
        setLoading(false);
      };
      fetchLesson();
    }
  }, [lessonId]);

  useEffect(() => {
    if (initialData) {
      const formattedDueDate = initialData.due_date
        ? new Date(initialData.due_date).toISOString().split("T")[0]
        : "";
      setName(initialData.name || "");
      setContent(initialData.content || "");
      setDueDate(formattedDueDate);
      setLinks((initialData.links || []).join("\n"));
      setType(initialData.type || "");
      setGrade(initialData.grade || 0);
      setLessonPlanIds(initialData.lesson_plan_ids || []);
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

  const handleClose = () => {
    router.push("/lesson");
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
      const httpRequest = new HttpRequest();
      let fileUrl = initialData?.file;
      if (file) {
        const upload = await httpRequest.uploadFile(file);
        fileUrl = upload.publicUrl;
      }
      const linksArray = links
        ? links
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean)
        : undefined;

      let createdLesson;
      if (initialData?._id) {
        createdLesson = await httpRequest.updateLessonAndLessonPlans(
          initialData._id,
          name,
          dueDate,
          content,
          type,
          grade,
          fileUrl,
          linksArray,
          lessonPlanIds.length ? lessonPlanIds : undefined
        );
      } else {
        createdLesson = await httpRequest.createLesson(
          name,
          dueDate,
          content,
          type,
          grade,
          teacherId,
          fileUrl,
          linksArray,
          lessonPlanIds.length ? lessonPlanIds : undefined
        );
      }
      if (createdLesson?._id) {
        router.push("/lesson");
      }
    } catch (error) {
      console.error("Erro ao salvar aula:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Carregando exercício...</p>;

  return (
    <div>
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
            <TextArea
              placeholder="Digite o conteúdo da aula"
              value={content}
              onChange={(e) => setContent(e)}
              rows={3}
            />
          </div>

          <div className="col-span-1">
            <Label>Upload de Arquivo</Label>
            <FileInput onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <Label className="mt-2">Links (um por linha)</Label>
            <TextArea
              placeholder="Digite links relacionados à aula"
              value={links}
              onChange={(e) => setLinks(e)}
              rows={3}
              required={false}
            />
          </div>

          <div>
            <span className="text-sm font-medium text-gray-800 dark:text-white">
              Tipo de aula*
            </span>
            <Tooltip
              position="right"
              width="330px"
              content="Se o objetivo da aula for somente mostrar o conteúdo selecione leitura, caso seja intruções para um trabalho selecione trabalho"
            >
              <HelpCircle className="w-4 h-4 text-blue-600 cursor-help" />
            </Tooltip>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
              className="w-full rounded-md border border-gray-300 p-2 text-gray-900 dark:bg-navy-700 dark:text-white"
            >
              <option value="" disabled>
                Selecione o tipo de aula
              </option>
              <option value="lesson">Aula</option>
              <option value="school_work">Trabalho</option>
            </select>
          </div>

          <div className="col-span-1">
            <span className="text-sm font-medium text-gray-800 dark:text-white">
              Plano de Aula*
            </span>
            <Tooltip
              position="right"
              width="330px"
              content="Isso define a qual plano de aula o exercício será atribuído. Pode ser não selecionar, se preferir não vincular a nenhum por enquanto."
            >
              <HelpCircle className="w-4 h-4 text-blue-600 cursor-help" />
            </Tooltip>
            <MultiSelect
              options={options}
              defaultSelected={lessonPlanIds}
              onChange={(selected) => setLessonPlanIds(selected)}
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
              : initialData?._id
              ? "Editar Aula"
              : "Criar Aula"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default LessonForm;
