"use client";

import React, { useEffect, useState } from "react";

import Button from "@/components/ui/button/Button";
import { DocsIcon } from "@/icons";
import { HttpRequest } from "@/utils/http-request";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import LessonPlanList from "@/components/lesson-plan/LessonPlanList";
import { Modal } from "@/components/ui/modal";
import useAuth from "@/hooks/useAuth";
import Image from "next/image";

export default function LessonPlan() {
    useAuth();

    const [isOpen, setIsOpen] = useState(false);
    const [isImageModalOpen, setImageModalOpen] = useState(false);
    const [images, setImages] = useState<string[]>([]);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [error, setError] = useState<string | null>(null);

    const loadImages = () => {
        setImages([ 
            "/images/brand/node.svg",
            "/images/brand/math.svg",
            "/images/brand/language.svg",
            "/images/brand/history.svg",
        ]);
    };

    const createLessonPlan = async (name: string, icon: string) => {
        const httpRequest = new HttpRequest();
        try {
            const response = await httpRequest.createLessonPlan(name, icon);
            if (response) {
                setIsOpen(false); 
                window.location.reload();
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
        setImageModalOpen(false); 
    };

    const handleSave = () => {
        if (name && selectedImage) {
            const iconName = selectedImage.split("/").pop()?.split(".")[0];
            if (iconName) {
                createLessonPlan(name, iconName); 
            }
        } else {
            setError("Nome ou ícone não selecionado.");
        }
    };

    useEffect(() => {
        loadImages();
    }, []);

    return (
        <div className="grid grid-cols-12 gap-4 md:gap-6">
            <div className="col-span-12">
                <LessonPlanList />
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
                                <Image src={selectedImage} alt="Ícone selecionado" className="w-16 h-16" />
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
                            <Image src={image} alt={`Imagem ${index + 1}`} className="w-full h-auto border rounded-lg" />
                        </div>
                    ))}
                </div>
            </Modal>
        </div>
    );
}
