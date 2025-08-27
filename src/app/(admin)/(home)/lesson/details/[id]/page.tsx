"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { HttpRequest } from "@/utils/http-request";
import { ILesson } from "@/utils/interfaces/lesson.interface";
import { IUser } from "@/utils/interfaces/user.interface";
import FileInput from "@/components/form/input/FileInput";
import { TokenPayload } from "../../../exercise/form/page";
import { jwtDecode } from "jwt-decode";
import { FileDown, Play } from "lucide-react";
import LessonPlanBreadcrumb from "@/components/ui/breadcrumb/LessonPlanBreadCrumb";
import { ILessonPlanByRole } from "@/utils/interfaces/lesson-plan.interface";

const getFileNameFromUrl = (url: string): string => {
  if (!url) return "Arquivo";
  try {
    const decodedUrl = decodeURIComponent(url);
    const fileNameWithPrefix = decodedUrl.substring(
      decodedUrl.lastIndexOf("/") + 1
    );
    return fileNameWithPrefix.replace(/^\d+-/, "");
  } catch (error) {
    console.error("URL inválida:", url, error);
    return "Arquivo";
  }
};

const LessonDetailsPage = () => {
  const params = useParams();
  const lessonId = params.id as string;
  const [lesson, setLesson] = useState<ILesson | null>(null);
  const [teacherName, setTeacherName] = useState<string | null>(null);
  const [lessonPlanId, setLessonPlanId] = useState<string | null>(null);
  const [lessonPlanName, setLessonPlanName] = useState<string | null>(null);
  const [studentFile, setStudentFile] = useState<File | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [submittedWorks, setSubmittedWorks] = useState<
    { name: string; filePath: string }[]
  >([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStudentFile(e.target.files?.[0] || null);
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!studentFile) return;
    try {
      const httpRequest = new HttpRequest();
      const token = localStorage.getItem("token");
      const decoded = jwtDecode<TokenPayload>(token!);
      try {
        const progress = await httpRequest.findOneByLessonAndUser(
          lessonId,
          decoded._id,
          "SCHOOL_WORK"
        );
        if (progress && progress.file_path) {
          setUploadMessage("Você já enviou este trabalho.");
          setStudentFile(null);
          setHasSubmitted(true);
          return;
        }
      } catch {}
      await httpRequest.submitLessonWork(lessonId, studentFile);
      setUploadMessage("Arquivo enviado com sucesso!");
      setStudentFile(null);
      setHasSubmitted(true);
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

  useEffect(() => {
    const fetchTeacherName = async () => {
      if (lesson && lesson.teacher_id) {
        try {
          const httpRequest = new HttpRequest();
          const teacher: IUser = await httpRequest.getUserById(
            lesson.teacher_id
          );
          setTeacherName(teacher.name);
        } catch (error) {
          console.error("Erro ao buscar nome do professor:", error);
          setTeacherName("Não encontrado");
        }
      }
    };

    fetchTeacherName();
  }, [lesson]);

  useEffect(() => {
    const fetchUserType = async () => {
      const httpRequest = new HttpRequest();
      try {
        const user = await httpRequest.getUserByRole();
        setUserType(user.role);
      } catch (error) {
        console.error("Erro ao buscar papel do usuário:", error);
      }
    };
    fetchUserType();
  }, []);

  useEffect(() => {
    const fetchSubmittedWorks = async () => {
      if (userType === "TEACHER" && lesson?.type === "school_work") {
        const httpRequest = new HttpRequest();
        try {
          const students: { _id: string; name: string }[] =
            await httpRequest.findAllStudentsByLessonId(
              lessonId,
              lessonPlanId as string
            );
          const delivered: { name: string; filePath: string }[] = [];
          for (const s of students) {
            try {
              const progress = await httpRequest.getSubmittedWork(
                lessonId,
                s._id
              );
              if (progress && progress.url) {
                delivered.push({ name: s.name, filePath: progress.url });
              }
            } catch {}
          }
          setSubmittedWorks(delivered);
        } catch (error) {
          console.error("Erro ao buscar trabalhos enviados:", error);
        }
      }
    };
    fetchSubmittedWorks();
  }, [userType, lessonId, lesson, lessonPlanId]);

  useEffect(() => {
    const checkSubmission = async () => {
      if (userType === "STUDENT" && lesson?.type === "school_work") {
        const httpRequest = new HttpRequest();
        const token = localStorage.getItem("token");
        const decoded = jwtDecode<TokenPayload>(token!);
        try {
          const progress = await httpRequest.findOneByLessonAndUser(
            lessonId,
            decoded._id,
            "SCHOOL_WORK"
          );
          if (progress && progress.file_path) {
            setHasSubmitted(true);
          }
        } catch (error) {
          console.error("Erro ao verificar envio do trabalho:", error);
        }
      }
    };
    checkSubmission();
  }, [userType, lessonId, lesson]);

  if (!lesson) return <div className="text-center p-10">Carregando...</div>;

  const hasResources =
    (lesson.file && lesson.file.length > 0) ||
    (lesson.links && lesson.links.length > 0);

  return (
    <div className="bg-gray-50 font-sans p-4 sm:p-6 md:p-8">
      <main className="max-w-4xl mx-auto">
         {" "}
        <LessonPlanBreadcrumb
          lessonPlanId={lessonPlanId}
          lessonPlanName={lessonPlanName}
          currentName={lesson.name}
        />
        <header>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {lesson.name}
          </h1>
          <div className="flex items-center flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500 border-t pt-4">
            <span>
              👤 {teacherName ? `Prof. ${teacherName}` : "Carregando..."}
            </span>
            <span>
              {lesson.type === "school_work"
                ? "📚 Trabalho"
                : "📚 Aula Teórica"}
            </span>
          </div>
        </header>
        <article className="mt-8 bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-200">
          <div
            className="content-render max-w-none" 
            dangerouslySetInnerHTML={{ __html: lesson.content || "" }}
          />
        </article>
        {hasResources && (
          <section className="mt-8 bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-5">
              Recursos da Aula
            </h2>
            <div className="space-y-3">
              {lesson.file?.map((fileUrl, index) => (
                <div
                  key={`file-${index}`}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <FileDown
                      size={24}
                      className="text-gray-700 flex-shrink-0"
                    />
                    <div className="overflow-hidden">
                      <h4
                        className="font-semibold text-gray-800 truncate"
                        title={getFileNameFromUrl(fileUrl)}
                      >
                        {getFileNameFromUrl(fileUrl)}
                      </h4>
                      <p className="text-sm text-gray-500">
                        Arquivo para download
                      </p>
                    </div>
                  </div>
                  <a
                    href={fileUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto flex-shrink-0 text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                  >
                    Baixar
                  </a>
                </div>
              ))}

              {lesson.links?.map((videoLink, index) => (
                <div
                  key={`link-${index}`}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <Play size={24} className="text-gray-700 flex-shrink-0" />
                    <div className="overflow-hidden">
                      <h4 className="font-semibold text-gray-800">
                        Vídeo Complementar
                      </h4>
                      <p
                        className="text-sm text-gray-500 truncate"
                        title={videoLink}
                      >
                        {videoLink}
                      </p>
                    </div>
                  </div>
                  <a
                    href={videoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto flex-shrink-0 text-center bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-6 border border-gray-300 rounded-lg shadow-sm transition-colors"
                  >
                    Assistir
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}
        {lesson.type === "school_work" && (
          <section className="mt-8 bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-200">
            {userType === "STUDENT" ? (
              hasSubmitted ? (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Enviar Trabalho
                  </h2>
                  <p className="mt-4 text-green-700 bg-green-50 p-4 rounded-lg">
                    Você já enviou este trabalho.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleUpload} className="space-y-4">
                  <h2 className="text-2xl font-bold text-gray-800">
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
                    className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
                  >
                    Enviar
                  </button>
                </form>
              )
            ) : userType === "TEACHER" ? (
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Trabalhos Enviados
                </h2>
                {submittedWorks.length > 0 ? (
                  <ul className="mt-4 space-y-3">
                    {submittedWorks.map((s) => (
                      <li
                        key={s.filePath}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <span className="text-gray-800">{s.name}</span>
                        <a
                          href={s.filePath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg text-sm"
                        >
                          Baixar
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-gray-500">
                    Nenhum trabalho enviado ainda.
                  </p>
                )}
              </div>
            ) : null}
          </section>
        )}
      </main>
    </div>
  );
};

export default LessonDetailsPage;
