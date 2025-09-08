"use client";

import { useEffect, useState } from "react";
import { HttpRequest } from "@/utils/http-request";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import FileInput from "@/components/form/input/FileInput";
import Label from "@/components/form/Label";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { jwtDecode } from "jwt-decode";
import { ILesson } from "@/utils/interfaces/lesson.interface";

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
  const [links, setLinks] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState("");
  const [grade, setGrade] = useState(0);
  const [selectedLessonPlan, setSelectedLessonPlan] = useState("");
  const [loading, setLoading] = useState(false);
  const [teacherId, setTeacherId] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      const formattedDueDate = initialData.due_date
        ? new Date(initialData.due_date).toISOString().split("T")[0]
        : "";
      setName(initialData.name || "");
      setContent(initialData.content || "");
      setPoints(initialData.points || 0);
      setDueDate(formattedDueDate);
      setLinks((initialData.links || []).join("\n"));
      setType(initialData.type || "");
      setGrade(initialData.grade || 0);
      setSelectedLessonPlan(initialData.lesson_plan_ids.join(", "));;
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
          fileUrl,
          linksArray,
          type,
          grade,
          selectedLessonPlan ? [selectedLessonPlan] : undefined
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
          selectedLessonPlan ? [selectedLessonPlan] : undefined
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
            <Label>Upload de Arquivo</Label>
            <FileInput onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <Label className="mt-2">Links (um por linha)</Label>
            <TextArea
              placeholder="Digite links relacionados à aula"
              value={links}
              onChange={(e) => setLinks(e)}
              rows={3}
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
