"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { ClipboardType, FileText, UploadCloud } from "lucide-react";

import { HttpRequest } from "@/utils/http-request";
import { ILesson } from "@/utils/interfaces/lesson.interface";
import { ILessonPlanByRole } from "@/utils/interfaces/lesson-plan.interface";

import Input from "@/components/form/input/InputField";
import FileInput from "@/components/form/input/FileInput";
import TextArea from "@/components/form/input/TextArea";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import LessonEditor from "@/components/lesson/LessonEditor";

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
        const ids = associations.map(
          (a: { lesson_plan_id: string }) => a.lesson_plan_id
        );
        setInitialData(lesson);
        setLessonPlanIds(ids);
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

  const handleClose = () => router.push("/lesson");

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
        createdLesson = await httpRequest.updateLesson(
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
          teacherId!,
          fileUrl,
          linksArray,
          lessonPlanIds.length ? lessonPlanIds : undefined
        );
      }
      if (createdLesson?._id) router.push("/lesson");
    } catch (error) {
      console.error("Erro ao salvar aula:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Carregando exercício...</p>;

  return (
    <div className="space-y-6">
      <h4 className="text-lg font-medium text-gray-800 dark:text-white/90">
        {initialData?._id ? "Editar Aula" : "Criar Nova Aula"}
      </h4>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* GRID 2 COLUNAS (ESQ empilhada / DIR editor) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* COLUNA ESQUERDA */}
          <div className="space-y-6 lg:col-span-1">
            {/* Informações Básicas */}
            <div className="p-6 bg-white rounded-lg shadow-md dark:bg-navy-800">
              <Label>
                <div className="flex items-center gap-2 mb-2 text-lg font-medium">
                  <ClipboardType className="w-5 h-5" />
                  <span>Informações Básicas</span>
                </div>
              </Label>
              <div className="space-y-4">
                <div>
                  <Label>Nome da Aula*</Label>
                  <Input
                    type="text"
                    placeholder="Digite o nome da aula"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Tipo de Aula*</Label>
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
              </div>
            </div>

            {/* Upload de Arquivo */}
            <div className="p-6 bg-white rounded-lg shadow-md dark:bg-navy-800">
              <Label>
                <div className="flex items-center gap-2 mb-2 text-lg font-medium">
                  <UploadCloud className="w-5 h-5" />
                  <span>Upload de Arquivo</span>
                </div>
              </Label>
              <FileInput
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>

            {/* Links Relacionados */}
            <div className="p-6 bg-white rounded-lg shadow-md dark:bg-navy-800">
              <Label>
                <div className="mb-2 text-lg font-medium">
                  Links Relacionados
                </div>
              </Label>
              <TextArea
                placeholder="Links (um por linha)"
                value={links}
                onChange={(v) => setLinks(v)}
                rows={4}
                required={false}
              />
            </div>
          </div>

          {/* COLUNA DIREITA - EDITOR */}
          <div className="lg:col-span-2">
            <div className="p-6 bg-white rounded-lg shadow-md dark:bg-navy-800">
              <Label>
                <div className="flex items-center gap-2 mb-2 text-lg font-medium">
                  <FileText className="w-5 h-5" />
                  <span>Conteúdo da Aula*</span>
                </div>
              </Label>

              <div className="min-h-[520px]">
                <LessonEditor
                  value={content}
                  onChange={(html) => setContent(html)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end w-full gap-3">
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
