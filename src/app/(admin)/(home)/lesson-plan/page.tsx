"use client";

import React, { useEffect, useState } from "react";

import Button from "@/components/ui/button/Button";
import { DocsIcon } from "@/icons";
import { HttpRequest } from "@/utils/http-request";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import LessonPlanList from "@/components/lesson-plan/LessonPlanList";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";

export default function LessonPlan() {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isOpen, setIsOpen] = useState(false); // Estado para controle da modal
    const [isImageModalOpen, setImageModalOpen] = useState(false);
    const [images, setImages] = useState<string[]>([]);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [lessonPlans, setLessonPlans] = useState<any[]>([]);

    const loadImages = () => {
        setImages([
            "/images/brand/brand-01.svg",
            "/images/brand/brand-02.svg",
            "/images/brand/brand-03.svg",
            "/images/brand/brand-04.svg",
            "/images/brand/brand-05.svg",
            "/images/brand/brand-06.svg",
        ]);
    };

    // Função para buscar os planos de aula
    const fetchLessonPlans = async () => {
        const httpRequest = new HttpRequest();
        try {
            const response = await httpRequest.getLessonPlansByRole();
            if (response) {
                setLessonPlans(response); // Atualiza a lista de planos
            } else {
                setError("Erro ao carregar os planos de aula.");
            }
        } catch (err) {
            setError("Erro ao carregar os planos de aula.");
            console.error("Erro ao carregar planos de aula:", err);
        }
    };

    // Função para criar um novo plano de aula
    const createLessonPlan = async (name: string, icon: string) => {
        const httpRequest = new HttpRequest();
        try {
            const response = await httpRequest.createLessonPlan(name, icon);
            if (response) {
                console.log("Plano de aula criado:", { name, icon });
                fetchLessonPlans(); // Atualiza a lista de planos
            } else {
                setError("Erro ao criar o plano de aula. Tente novamente.");
            }
        } catch (err) {
            setError("Erro ao criar o plano de aula. Tente novamente.");
            console.error("Erro ao criar plano de aula:", err);
        }
    };

    const handleImageSelect = (imagePath: string) => {
        setSelectedImage(imagePath);
        setImageModalOpen(false); // Fecha a modal de seleção de ícone
    };

    const handleSave = () => {
        if (name && selectedImage) {
            const iconName = selectedImage.split("/").pop()?.split(".")[0];
            if (iconName) {
                createLessonPlan(name, iconName); // Cria o plano de aula
            }
        } else {
            setError("Nome ou ícone não selecionado.");
        }
    };

    // useEffect para carregar as imagens e planos de aula
    useEffect(() => {
        loadImages();
        fetchLessonPlans(); // Carrega os planos de aula ao montar o componente
    }, []);

    return (
        <div className="grid grid-cols-12 gap-4 md:gap-6">
            <div className="col-span-12">
                <LessonPlanList lessonPlans={lessonPlans} />
            </div>
            <div className="col-span-12">
                <Button size="sm" variant="primary" endIcon={<DocsIcon />} onClick={() => setIsOpen(true)}>
                    Adicionar plano de aula
                </Button>
            </div>

            {error && <div className="text-red-500 text-sm">{error}</div>}

            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                className="max-w-[584px] p-5 lg:p-10"
            >
                <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
                    Crie um novo plano de aula
                </h4>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                    <div className="col-span-1">
                        <Label>Nome</Label>
                        <Input
                            type="text"
                            placeholder="Emirhan"
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="col-span-1">
                        <Label>Ícone</Label>
                        {selectedImage ? (
                            <div>
                                <img src={selectedImage} alt="Ícone selecionado" className="w-16 h-16" />
                                <p className="text-sm text-gray-500">{selectedImage}</p>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">Nenhuma imagem selecionada</p>
                        )}
                        <Button size="sm" variant="outline" onClick={() => setImageModalOpen(true)}>
                            Selecionar ícone
                        </Button>
                    </div>
                </div>

                <div className="flex items-center justify-end w-full gap-3 mt-6">
                    <Button size="sm" variant="outline" onClick={() => setIsOpen(false)}>
                        Fechar
                    </Button>
                    <Button size="sm" onClick={handleSave}>
                        Salvar
                    </Button>
                </div>
            </Modal>

            <Modal
                isOpen={isImageModalOpen}
                onClose={() => setImageModalOpen(false)}
                className="max-w-[584px] p-5 lg:p-10"
            >
                <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
                    Selecione uma imagem
                </h4>

                <div className="grid grid-cols-3 gap-4">
                    {images.map((image, index) => (
                        <div key={index} className="cursor-pointer" onClick={() => handleImageSelect(image)}>
                            <img src={image} alt={`Imagem ${index + 1}`} className="w-full h-auto border rounded-lg" />
                        </div>
                    ))}
                </div>
            </Modal>
        </div>
    );
}
