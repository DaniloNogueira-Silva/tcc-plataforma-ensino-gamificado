"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { HttpRequest } from "@/utils/http-request";

type SimpleUser = { _id: string; name: string };

type LessonCardProps = {
  lessonId: string;
  lessonPlanId: string;
  name: string;
  content: string;
  type: string; // "lesson" | "school_work" | ...
};

const LessonCard: React.FC<LessonCardProps> = ({
  lessonId,
  lessonPlanId,
  name,
  content,
  type,
}) => {
  const router = useRouter();

  const [userType, setUserType] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // 1) se já marcou alguma vez (controla XP 1x)
  const [hasEverCompleted, setHasEverCompleted] = useState(false);
  // 2) estado VISUAL do checkbox (pode alternar livremente; não persiste no servidor)
  const [checked, setChecked] = useState(false);
  const [isMarking, setIsMarking] = useState(false);

  // professor (trabalho)
  const [allStudents, setAllStudents] = useState<SimpleUser[]>([]);
  const [deliveredStudents, setDeliveredStudents] = useState<SimpleUser[]>([]);
  const [showDeliveries, setShowDeliveries] = useState(false);

  const isWork = type === "school_work";

  const normalizeUsers = (arr: any[]): SimpleUser[] =>
    (arr ?? [])
      .map((item: any) => item?.user_id ?? item)
      .filter(Boolean)
      .map((u: any) => ({ _id: String(u._id), name: String(u.name ?? "") }));

  const notDeliveredStudents = useMemo(
    () =>
      allStudents.filter(
        (s) => !deliveredStudents.some((d) => d._id === s._id)
      ),
    [allStudents, deliveredStudents]
  );

  useEffect(() => {
    const load = async () => {
      const http = new HttpRequest();
      const me = await http.getUserByRole();
      setUserType(me.role);
      setUserId(me._id ?? null);

      // STUDENT em LESSON: consulta inicial para saber se já existe marcação
      if (me.role === "STUDENT" && !isWork) {
        try {
          const progress = await http.findOneByLessonAndUser(lessonId, me._id);
          const exists = !!progress; // se retornar algo → já marcou
          setHasEverCompleted(exists); // controla XP 1x
          setChecked(exists); // estado visual começa marcado se já existia
        } catch (e) {
          console.error("Erro ao buscar progresso do aluno na aula:", e);
          setHasEverCompleted(false);
          setChecked(false);
        }
      }

      // TEACHER em WORK: carregar entregas
      if (me.role === "TEACHER" && isWork) {
        try {
          const students: SimpleUser[] =
            await http.findAllStudentsByLessonPlanId(lessonPlanId);
          setAllStudents(students ?? []);
        } catch (e) {
          setAllStudents([]);
          console.error("Erro ao buscar alunos do plano:", e);
        }

        try {
          const submissions = await http.findAllStudentsByExerciseListId(
            lessonId
          );
          setDeliveredStudents(normalizeUsers(submissions));
        } catch (e) {
          setDeliveredStudents([]);
          console.error("Erro ao buscar entregas:", e);
        }
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId, lessonPlanId, isWork]);

  const handleCardClick = () => router.push(`/lesson/details/${lessonId}`);

  // Clique do aluno no "checkbox":
  // - Se NUNCA marcou e está marcando agora -> chama markLessonCompleted (dá 5 XP).
  // - Depois disso, alterna só visualmente (sem bater no back).
  const onToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMarking) return;

    const next = !checked;

    // otimista: alterna o visual já
    setChecked(next);

    if (!hasEverCompleted && next) {
      setIsMarking(true);
      try {
        await new HttpRequest().markLessonCompleted(lessonId); // XP 1x no back
        setHasEverCompleted(true);
      } catch (error) {
        console.error("Erro ao marcar como lido:", error);
        // rollback visual se falhar a primeira marcação
        setChecked(false);
      } finally {
        setIsMarking(false);
      }
    }
    // se já tinha marcado alguma vez, não chamamos nada (apenas visual)
  };

  const typeLabels: Record<string, string> = {
    lesson: "Aula",
    school_work: "Trabalho",
  };

  return (
    <>
      <div className="relative group cursor-pointer" onClick={handleCardClick}>
        <div className="flex items-stretch justify-between gap-4 rounded-xl bg-white p-4">
          <div className="flex flex-col gap-1 flex-[2_2_0px]">
            <p className="text-[#6a7581] text-sm font-normal leading-normal">
              {typeLabels[type] || type}
            </p>
            <p className="text-[#121416] text-base font-bold leading-tight line-clamp-1">
              {name}
            </p>
            <p className="text-[#6a7581] text-sm font-normal leading-normal break-words line-clamp-3">
              {content}
            </p>
          </div>

          {userType === "TEACHER" && isWork && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDeliveries(true);
              }}
              className="min-w-[56px] h-8 px-3 rounded-xl bg-[#f1f2f4] text-sm font-semibold text-[#121416] flex items-center justify-center"
              title="Ver entregas"
            >
              {deliveredStudents.length}/{allStudents.length}
            </button>
          )}

          {/* STUDENT: somente em LESSON (em WORK não mostra nem chama nada) */}
          {userType === "STUDENT" && !isWork && (
            <button
              onClick={onToggle}
              disabled={isMarking}
              className={`flex h-8 w-8 items-center justify-center rounded-md border ${
                checked ? "border-[#4caf50]" : "border-[#cfd4da]"
              } bg-white hover:bg-[#f8f9fa] disabled:opacity-60`}
              title={
                !hasEverCompleted
                  ? checked
                    ? "Marcando como lido (ganha 5XP)"
                    : "Marcar como lido (ganha 5XP)"
                  : checked
                  ? "Desmarcar (visual)"
                  : "Marcar (visual)"
              }
              aria-pressed={checked}
            >
              <span className="text-base leading-none">
                {checked ? "✓" : ""}
              </span>
            </button>
          )}
        </div>
      </div>

      {showDeliveries && isWork && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setShowDeliveries(false)}
        >
          <div className="absolute inset-0 bg-black/30" />
          <div
            className="relative z-10 w-full max-w-md rounded-2xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-[#121416]">Entregas</h3>
              <button
                className="w-8 h-8 rounded-full bg-[#f1f2f4] text-[#121416]"
                onClick={() => setShowDeliveries(false)}
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="font-semibold mb-1">Entregaram</p>
                <ul className="list-disc list-inside text-sm text-[#121416]">
                  {deliveredStudents.length === 0 && (
                    <li>Ninguém entregou ainda</li>
                  )}
                  {deliveredStudents.map((s) => (
                    <li key={s._id}>{s.name}</li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="font-semibold mb-1">Não Entregaram</p>
                <ul className="list-disc list-inside text-sm text-[#121416]">
                  {notDeliveredStudents.map((s) => (
                    <li key={s._id}>{s.name}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LessonCard;
