"use client";

import {
  MoreHorizontalIcon,
  PenIcon,
  Trash2Icon,
  UserPlusIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import Button from "../ui/button/Button";
import { HttpRequest } from "@/utils/http-request";
import Image from "next/image";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { Modal } from "../ui/modal";
import ProgressBar from "../progress-bar/ProgressBar";

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
  const [isImageModalOpen, setImageModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(lessonPlanName);
  const [selectedImage, setSelectedImage] = useState<string>(imgUrl);
  const [images, setImages] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setImages([
      "/images/brand/node.svg",
      "/images/brand/math.svg",
      "/images/brand/language.svg",
      "/images/brand/history.svg",
      "/images/brand/science.svg",
      "/images/brand/geography.svg",
      "/images/brand/art.svg",
    ]);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropdownOpen(prev => !prev);
  };

  const createActionHandler = (action: () => void) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    action();
    setIsDropdownOpen(false);
  };

  const handleDelete = async () => {
    if (window.confirm("Tem certeza que deseja deletar este plano de aula?")) {
      const httpRequest = new HttpRequest();
      await httpRequest.removeLessonPlan(lessonPlanId);
      onUpdateSuccess();
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    const httpRequest = new HttpRequest();
    const iconName = selectedImage.split("/").pop()?.split(".")[0];
    await httpRequest.updateLessonPlan(lessonPlanId, name, iconName);
    setLoading(false);
    setEditModalOpen(false);
    onUpdateSuccess();
  };

  const handleImageSelect = (imagePath: string) => {
    setSelectedImage(imagePath);
    setImageModalOpen(false);
  };

  const handleInvite = async () => {
    const inviteLink = `${window.location.origin}/lesson-plan/invite/${lessonPlanId}`;
    await navigator.clipboard.writeText(inviteLink);
    alert("Link de convite copiado para a área de transferência!");
  };

  return (
    <>
      <div className={`relative flex flex-col justify-between min-h-36 rounded-2xl border border-gray-200 bg-white px-6 pb-5 pt-6 overflow-hidden transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-white/[0.03] ${isDropdownOpen ? 'z-10' : 'z-0'}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex-shrink-0">
              <Image width={40} height={40} className="w-full" src={imgUrl} alt={lessonPlanName} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">{lessonPlanName}</h3>
              <span className="block text-gray-500 text-theme-xs dark:text-gray-400">{teacherName}</span>
            </div>
          </div>

          <div className="relative z-20" ref={dropdownRef}>
            <button
              onClick={handleDropdownClick}
              className="p-1 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10"
              aria-label="Opções"
            >
              <MoreHorizontalIcon size={20} />
            </button>
            {isDropdownOpen && (
              <div className="absolute top-0 right-full  mr-0 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 py-1">
                <button onClick={createActionHandler(handleInvite)} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <UserPlusIcon size={16} /><span>Convidar</span>
                </button>
                <button onClick={createActionHandler(() => setEditModalOpen(true))} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <PenIcon size={16} /><span>Editar</span>
                </button>
                <button onClick={createActionHandler(handleDelete)} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">
                  <Trash2Icon size={16} /><span>Deletar</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-5 sm:max-w-[320px] w-full">
          <ProgressBar progress={progress} size="lg" label="inside" />
        </div>
      </div>

      {/* Modais */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} className="max-w-[500px] p-5 lg:p-10">
        <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">Editar plano de aula</h4>
        <div className="space-y-5">
          <div>
            <Label>Nome</Label>
            <Input onChange={(e) => setName(e.target.value)} defaultValue={name} />
          </div>
          <div>
            <Label>Ícone</Label>
            <div className="flex items-center gap-4">
              {selectedImage && <Image src={selectedImage} alt="Ícone selecionado" width={48} height={48} className="w-12 h-12 rounded-md" />}
              <Button
                size="sm"
                variant="outline"
                onClick={() => setImageModalOpen(true)}
              >
                Selecionar ícone
              </Button>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setEditModalOpen(false)}>Cancelar</Button>
          <Button onClick={handleUpdate} disabled={loading}>{loading ? "Salvando..." : "Salvar"}</Button>
        </div>
      </Modal>

      <Modal isOpen={isImageModalOpen} onClose={() => setImageModalOpen(false)} className="max-w-[584px] p-5 lg:p-10">
        <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">Selecione uma imagem</h4>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="cursor-pointer p-2 border rounded-lg hover:border-blue-500" onClick={() => handleImageSelect(image)}>
              <Image src={image} alt={`Imagem ${index + 1}`} width={150} height={150} className="w-full h-auto" />
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
};

export default LessonPlanCard;