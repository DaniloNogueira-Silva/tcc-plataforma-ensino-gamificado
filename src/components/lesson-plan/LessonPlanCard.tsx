"use client";

import { PencilIcon, Trash2Icon, UserPlusIcon } from "lucide-react";

import Button from "../ui/button/Button";
import { HttpRequest } from "@/utils/http-request";
import Image from "next/image";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { Modal } from "../ui/modal";
import ProgressBar from "../progress-bar/ProgressBar";
import { useState } from "react";

type LessonPlanCardProps = {
  imgUrl: string;
  lessonPlanName: string;
  progress: number;
  teacherName: string;
  lessonPlanId: string;
  onUpdateSuccess: () => void;
};

const LessonPlanCard: React.FC<LessonPlanCardProps> = ({
  imgUrl,
  lessonPlanName,
  progress,
  teacherName,
  lessonPlanId,
  onUpdateSuccess,
}) => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [name, setName] = useState(lessonPlanName);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const httpRequest = new HttpRequest();
    await httpRequest.removeLessonPlan(lessonPlanId);
    onUpdateSuccess();
  };

  const handleUpdate = async () => {
    setLoading(true);
    const httpRequest = new HttpRequest();
    await httpRequest.updateLessonPlan(lessonPlanId, name);
    setLoading(false);
    setEditModalOpen(false);
    onUpdateSuccess();
  };

  const handleInvite = async () => {
    const inviteLink = `${window.location.origin}/lesson-plan/invite/${lessonPlanId}`;
    await navigator.clipboard.writeText(inviteLink);
    alert("Link copiado!");
  };

  return (
    <>
      <div className="relative group rounded-2xl border border-gray-200 bg-white px-6 pb-5 pt-6 overflow-hidden transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center gap-3 mb-6 z-10 relative">
          <div className="w-10 h-10">
            <Image
              width={40}
              height={40}
              className="w-full"
              src={imgUrl}
              alt={lessonPlanName}
            />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
              {lessonPlanName}
            </h3>
            <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
              {teacherName}
            </span>
          </div>
        </div>

        <div className="space-y-5 sm:max-w-[320px] w-full z-10 relative">
          <ProgressBar progress={progress} size="lg" label="inside" />
        </div>

        {/* overlay com botões */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-4 z-20">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleInvite();
            }}
            className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:bg-gray-200 transition"
            title="Convidar"
          >
            <UserPlusIcon size={18} />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setEditModalOpen(true);
            }}
            className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:bg-gray-200 transition"
            title="Editar"
          >
            <PencilIcon size={18} />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDelete();
            }}
            className="w-10 h-10 rounded-full bg-white text-red-600 flex items-center justify-center hover:bg-red-100 transition"
            title="Deletar"
          >
            <Trash2Icon size={18} />
          </button>
        </div>
      </div>

      {/* Modal de edição */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        className="max-w-[500px] p-5 lg:p-10"
      >
        <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
          Editar plano de aula
        </h4>
        <div className="space-y-5">
          <div>
            <Label>Nome</Label>
            <Input onChange={(e) => setName(e.target.value)} />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setEditModalOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleUpdate} disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default LessonPlanCard;

