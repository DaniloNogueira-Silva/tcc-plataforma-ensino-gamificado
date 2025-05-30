"use client";

import React, { useEffect, useState } from "react";

import Button from "../ui/button/Button";
import { HttpRequest } from "@/utils/http-request";
import { IAvatar } from "@/utils/interfaces/avatar.interface";
import { Modal } from "../ui/modal";
import { useModal } from "../../hooks/useModal";

const torsoOptions = ["torso_dourado", "torso_prata"];
const headOptions = ["cabelo_1", "capacete_dourado", "capacete_prata"];
const eyeOptions = ["olho_1", "olho_2", "olho_3"];

export default function UserAvatarCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const http = new HttpRequest();

  // Estados para edição na modal
  const [torsoIndex, setTorsoIndex] = useState(0);
  const [headIndex, setHeadIndex] = useState(0);
  const [eyeIndex, setEyeIndex] = useState(0);

  // Estados para opções salvas e exibidas fora da modal
  const [savedTorso, setSavedTorso] = useState(torsoOptions[0]);
  const [savedHead, setSavedHead] = useState(headOptions[0]);
  const [savedEye, setSavedEye] = useState(eyeOptions[0]);

  // Guarda avatar salvo retornado da API (para saber se deve criar ou atualizar)
  const [avatarFromApi, setAvatarFromApi] = useState<IAvatar | null>(null);

  // Helpers para saber se tem cabelo e qual olho mostrar
  const isHair = headOptions[headIndex].startsWith("cabelo");
  const currentEye = isHair ? eyeOptions[eyeIndex] : null;

  const isSavedHair = savedHead.startsWith("cabelo");
  const savedEyeFinal = isSavedHair ? savedEye : null;

  useEffect(() => {
    async function loadAvatar() {
      try {
        const avatar = await http.getAvatarByUserId();
        if (avatar) {
          setAvatarFromApi(avatar);

          // Atualiza os estados salvos para renderizar o avatar na tela
          setSavedTorso(avatar.torso);
          setSavedHead(avatar.head);
          setSavedEye(avatar.eyes);

          // Também atualiza os estados da modal para permitir edição com os valores atuais
          const torsoIdx = torsoOptions.indexOf(avatar.torso);
          const headIdx = headOptions.indexOf(avatar.head);
          const eyeIdx = eyeOptions.indexOf(avatar.eyes);

          if (torsoIdx !== -1) setTorsoIndex(torsoIdx);
          if (headIdx !== -1) setHeadIndex(headIdx);
          if (eyeIdx !== -1) setEyeIndex(eyeIdx);
        }
      } catch (error) {
        console.error("Erro ao carregar avatar no componente:", error);
      }
    }

    loadAvatar();
  }, []);

  const changeIndex = (
    currentIndex: number,
    setIndex: React.Dispatch<React.SetStateAction<number>>,
    options: string[],
    direction: "prev" | "next"
  ) => {
    const newIndex =
      direction === "next"
        ? (currentIndex + 1) % options.length
        : (currentIndex - 1 + options.length) % options.length;
    setIndex(newIndex);
  };

  // Salvar no backend: cria ou atualiza conforme existência
  async function handleSave() {
    const avatarToSave = {
      torso: torsoOptions[torsoIndex],
      head: headOptions[headIndex],
      eyes: headOptions[headIndex].startsWith("cabelo") ? eyeOptions[eyeIndex] : "",
    };

    try {
      let savedAvatar: IAvatar | null = null;
      if (!avatarFromApi) {
        // cria
        savedAvatar = await http.createAvatar(avatarToSave);
      } else {
        // atualiza - envia o id também para garantir
        savedAvatar = await http.updateAvatar({ ...avatarFromApi, ...avatarToSave });
      }

      if (savedAvatar) {
        setAvatarFromApi(savedAvatar);
        setSavedTorso(savedAvatar.torso);
        setSavedHead(savedAvatar.head);
        setSavedEye(savedAvatar.eyes);
        closeModal();
      }
    } catch (error) {
      console.error("Erro ao salvar avatar:", error);
      // Aqui pode exibir uma notificação de erro se quiser
    }
  }

  return (
    <>
      {/* Avatar exibido com as opções salvas */}
      <div className="p-4 border border-gray-200 rounded-2xl dark:border-gray-800 w-full max-w-sm flex flex-col items-center gap-4">
        <div className="relative w-56 h-56">
          <img
            src={`/images/avatar_components/${savedTorso}.svg`}
            alt="torso"
            className="absolute w-full h-full object-contain"
          />
          <img
            src={`/images/avatar_components/${savedHead}.svg`}
            alt="head"
            className="absolute w-full h-full object-contain"
            style={{ top: "-20%", position: "absolute", width: "60%", right: "20%" }}
          />
          {savedEyeFinal && (
            <img
              src={`/images/avatar_components/${savedEyeFinal}.svg`}
              alt="eyes"
              className="absolute object-contain"
              style={{
                width: "40%",
                left: "30%",
                top: "22%",
                transform: "scale(0.5)",
              }}
            />
          )}
        </div>

        <Button onClick={openModal}>Editar Avatar</Button>
      </div>

      {/* Modal de edição */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-md m-4">
        <div className="w-full max-w-md rounded-3xl bg-white p-6 dark:bg-gray-900 flex flex-col gap-6 items-center">
          <div className="relative w-56 h-56">
            <img
              src={`/images/avatar_components/${torsoOptions[torsoIndex]}.svg`}
              alt="torso"
              className="absolute w-full h-full object-contain"
            />
            <img
              src={`/images/avatar_components/${headOptions[headIndex]}.svg`}
              alt="head"
              className="absolute w-full h-full object-contain"
              style={{ top: "-20%", position: "absolute", width: "60%", right: "20%" }}
            />
            {currentEye && (
              <img
                src={`/images/avatar_components/${currentEye}.svg`}
                alt="eyes"
                className="absolute object-contain"
                style={{
                  width: "40%",
                  left: "30%",
                  top: "22%",
                  transform: "scale(0.5)",
                }}
              />
            )}
          </div>

          {/* Controles */}
          <div className="flex flex-col gap-4 w-full">
            <div className="flex justify-between items-center">
              <span className="text-sm">Torso</span>
              <div className="flex gap-2">
                <button onClick={() => changeIndex(torsoIndex, setTorsoIndex, torsoOptions, "prev")}>←</button>
                <button onClick={() => changeIndex(torsoIndex, setTorsoIndex, torsoOptions, "next")}>→</button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm">Cabeça</span>
              <div className="flex gap-2">
                <button onClick={() => changeIndex(headIndex, setHeadIndex, headOptions, "prev")}>←</button>
                <button onClick={() => changeIndex(headIndex, setHeadIndex, headOptions, "next")}>→</button>
              </div>
            </div>

            {isHair && (
              <div className="flex justify-between items-center">
                <span className="text-sm">Olhos</span>
                <div className="flex gap-2">
                  <button onClick={() => changeIndex(eyeIndex, setEyeIndex, eyeOptions, "prev")}>←</button>
                  <button onClick={() => changeIndex(eyeIndex, setEyeIndex, eyeOptions, "next")}>→</button>
                </div>
              </div>
            )}
          </div>

          {/* Botão salvar */}
          <Button onClick={handleSave}>Salvar</Button>
        </div>
      </Modal>
    </>
  );
}
