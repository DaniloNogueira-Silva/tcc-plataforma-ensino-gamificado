"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { HttpRequest } from "@/utils/http-request";
import { ILesson } from "@/utils/interfaces/lesson.interface";
import { ILessonPlanByRole } from "@/utils/interfaces/lesson-plan.interface";
import LessonPlanBreadcrumb from "@/components/ui/breadcrumb/LessonPlanBreadcrumb";
import FileInput from "@/components/form/input/FileInput";

const LessonDetailsPage = () => {
  const params = useParams();
  const lessonId = params.id as string;
  const [lesson, setLesson] = useState<ILesson | null>(null);
  const [lessonPlanId, setLessonPlanId] = useState<string | null>(null);
  const [lessonPlanName, setLessonPlanName] = useState<string | null>(null);
  const [studentFile, setStudentFile] = useState<File | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStudentFile(e.target.files?.[0] || null);
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!studentFile) return;
    try {
      const httpRequest = new HttpRequest();
      await httpRequest.uploadFile(studentFile);
      setUploadMessage("Arquivo enviado com sucesso!");
      setStudentFile(null);
    } catch (error) {
      console.error("Erro ao enviar arquivo:", error);
      setUploadMessage("Falha ao enviar arquivo.");
    }
  };

  useEffect(() => {
    async function fetchLesson() {
      if (!lessonId) return;
      const httpRequest = new HttpRequest();
      const data = await httpRequest.getLessonById(lessonId);
      setLesson(data);

      try {
        const associations = await httpRequest.getAssociationsByContent(
          lessonId,
          "lesson"
        );
        if (associations && associations.length > 0) {
          const planId = associations[0].lesson_plan_id;
          setLessonPlanId(planId);
          const plans: ILessonPlanByRole[] =
            await httpRequest.getLessonPlansByRole();
          const found = plans.find((p) => p.lessonplan._id === planId);
          if (found) {
            setLessonPlanName(found.lessonplan.name);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar plano de aula:", error);
      }
    }

    fetchLesson();
  }, [lessonId]);

  function getFileNameFromUrl(url?: string): string {
    if (!url) return "Arquivo";
    try {
      const decodedUrl = decodeURIComponent(url);
      const fileNameWithTimestamp = decodedUrl.substring(
        decodedUrl.lastIndexOf("/") + 1
      );
      return fileNameWithTimestamp.replace(/^\d+-/, "");
    } catch (error) {
      console.error("URL do arquivo inválida:", url, error);
      return "Arquivo";
    }
  }

  if (!lesson) return <div className="text-center p-10">Carregando...</div>;

  const formattedDate = lesson.due_date
    ? new Date(lesson.due_date).toLocaleDateString("pt-BR")
    : null;

  const cleanLinks = (lesson.links ?? [])
    .map((l) => (l ?? "").trim())
    .filter(Boolean);

  return (
    <div className="px-4 sm:px-8 md:px-20 lg:px-40 flex flex-1 justify-center py-5">
      <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
        <LessonPlanBreadcrumb
          lessonPlanId={lessonPlanId}
          lessonPlanName={lessonPlanName}
          currentName={lesson.name}
        />
        <div className="flex flex-wrap justify-between gap-3 p-4">
          <div className="flex min-w-72 flex-col gap-3">
            <h1 className="text-[#0e141b] tracking-light text-[32px] font-bold leading-tight">
              {lesson.name}
            </h1>
            {formattedDate && lesson.type !== "reading" && (
              <p className="text-[#4e7097] text-sm font-normal leading-normal">
                Data de entrega: {formattedDate}
              </p>
            )}
          </div>
        </div>
        <h2 className="text-[#0e141b] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
          Descrição
        </h2>
        <p className="text-[#0e141b] text-base font-normal leading-normal pb-3 pt-1 px-4 whitespace-pre-wrap break-words">
          {lesson.content}
        </p>

        {/* --- CORREÇÃO NA LÓGICA DE RENDERIZAÇÃO CONDICIONAL --- */}
        {/* Agora verifica o .length de ambos os arrays */}
        {((lesson.file && lesson.file.length > 0) || cleanLinks.length > 0) && (
          <div className="px-4 pt-5">
            <h2 className="text-[#0e141b] text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3">
              Recursos
            </h2>
            <div className="space-y-3">
              {/* --- CORREÇÃO: VERIFICA O .length E USA .map() --- */}
              {lesson.file &&
                lesson.file.length > 0 &&
                lesson.file.map((fileUrl) => (
                  <div
                    key={fileUrl} // Usa a URL do arquivo como chave única
                    className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg justify-between"
                  >
                    <div className="flex items-center gap-4 overflow-hidden">
                      <div className="text-[#0e141b] flex items-center justify-center rounded-lg bg-[#e7edf3] shrink-0 size-12">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24px"
                          height="24px"
                          fill="currentColor"
                          viewBox="0 0 256 256"
                        >
                          <path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Z" />
                        </svg>
                      </div>
                      <div className="flex flex-col justify-center overflow-hidden">
                        <p className="text-[#0e141b] text-base font-medium leading-normal truncate">
                          {getFileNameFromUrl(fileUrl)}
                        </p>
                        <p className="text-[#4e7097] text-sm font-normal leading-normal">
                          Arquivo para download
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0">
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-8 px-4 bg-[#e7edf3] text-[#0e141b] text-sm font-medium leading-normal transition-colors hover:bg-slate-200"
                      >
                        <span className="truncate">Baixar</span>
                      </a>
                    </div>
                  </div>
                ))}

              {/* A lógica para os links já estava correta, pois usava .length */}
              {cleanLinks.length > 0 && (
                <ul className="list-disc list-inside space-y-2 pt-2">
                  {cleanLinks.map((link, idx) => (
                    <li key={idx}>
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 break-words transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {lesson.type === "school_work" && (
          <form
            onSubmit={handleUpload}
            className="flex flex-col gap-3 px-4 pt-5"
          >
            <h2 className="text-[#0e141b] text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3">
              Enviar Trabalho
            </h2>
            <FileInput onChange={handleFileChange} />
            {uploadMessage && (
              <p
                className={`text-sm ${
                  uploadMessage.includes("sucesso")
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {uploadMessage}
              </p>
            )}
            <button
              type="submit"
              disabled={!studentFile}
              className="flex h-10 w-fit items-center justify-center rounded-lg bg-blue-600 px-6 text-sm font-medium text-white transition-opacity disabled:opacity-50 hover:bg-blue-700"
            >
              Enviar
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LessonDetailsPage;
