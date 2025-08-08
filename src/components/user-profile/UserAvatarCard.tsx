"use client";

import React, { useEffect, useState } from "react";

import Button from "../ui/button/Button";
import { HttpRequest } from "@/utils/http-request";
import { IAvatar } from "@/utils/interfaces/avatar.interface";
import { Modal } from "../ui/modal";
import { useModal } from "../../hooks/useModal";

const torsoOptions = ["dark_armor", "steel_armor", "dragon_armor", "florest_armor"];
const headOptions = ["dark_helmet", "steel_helmet", "dragon_helmet", "florest_helmet"];
const armOptions = ["dark_arm", "steel_arm", "dragon_arm", "florest_arm"];

export default function UserAvatarCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const http = new HttpRequest();

  // Estados para edição na modal
  const [torsoIndex, setTorsoIndex] = useState(0);
  const [headIndex, setHeadIndex] = useState(0);
  const [armIndex, setArmIndex] = useState(0);

  // Estados para opções salvas e exibidas fora da modal
  const [savedTorso, setSavedTorso] = useState(torsoOptions[0]);
  const [savedHead, setSavedHead] = useState(headOptions[0]);
  const [savedArm, setSavedArm] = useState(armOptions[0]);

  // Guarda avatar salvo retornado da API (para saber se deve criar ou atualizar)
  const [avatarFromApi, setAvatarFromApi] = useState<IAvatar | null>(null);

  useEffect(() => {
    async function loadAvatar() {
      try {
        const avatar = await http.getAvatarByUserId();
        if (avatar) {
          setAvatarFromApi(avatar);

          // Atualiza os estados salvos para renderizar o avatar na tela
          setSavedTorso(avatar.torso);
          setSavedHead(avatar.head);
          setSavedArm(avatar.arm);

          // Também atualiza os estados da modal para permitir edição com os valores atuais
          const torsoIdx = torsoOptions.indexOf(avatar.torso);
          const headIdx = headOptions.indexOf(avatar.head);
          const armIdx = armOptions.indexOf(avatar.arm);
          if (armIdx !== -1) setArmIndex(armIdx);
          if (torsoIdx !== -1) setTorsoIndex(torsoIdx);
          if (headIdx !== -1) setHeadIndex(headIdx);
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

  async function handleSave() {
    const avatarToSave = {
      torso: torsoOptions[torsoIndex],
      head: headOptions[headIndex],
    };

    try {
      let savedAvatar: IAvatar | null = null;
      if (!avatarFromApi) {
        savedAvatar = await http.createAvatar(avatarToSave);
      } else {
        savedAvatar = await http.updateAvatar({ ...avatarFromApi, ...avatarToSave });
      }

      if (savedAvatar) {
        setAvatarFromApi(savedAvatar);
        setSavedTorso(savedAvatar.torso);
        setSavedHead(savedAvatar.head);
        closeModal();
      }
    } catch (error) {
      console.error("Erro ao salvar avatar:", error);
    }
  }

  return (
    <>
      {/* Avatar exibido com as opções salvas */}
      <div className="p-4 border border-gray-200 rounded-2xl dark:border-gray-800 w-full max-w-sm flex flex-col items-center gap-4">
        <div className="relative w-56 h-56">
          <img
            src={`/images/avatar_components/${savedTorso}.png`}
            alt="torso"
            className="absolute w-full h-full object-contain"
            style={{ top: "17%", position: "absolute", width: "90%", right: "4.5%" }}
          />
          <img
            src={`/images/avatar_components/${savedHead}.png`}
            alt="head"
            className="absolute w-full h-full object-contain"
            style={{ top: "-30%", position: "absolute", width: "50%", right: "25%" }}
          />
        </div>

        <Button onClick={openModal}>Editar Avatar</Button>
      </div>

      {/* Modal de edição */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-md m-4">
        <div className="w-full max-w-md rounded-3xl bg-white p-6 dark:bg-gray-900 flex flex-col gap-6 items-center">
          <div className="relative w-56 h-56">
            <img
              src={`/images/avatar_components/${torsoOptions[torsoIndex]}.png`}
              alt="torso"
              className="absolute w-full h-full object-contain"
              style={{ top: "17%", position: "absolute", width: "90%", right: "4.5%" }}

            />
            <img
              src={`/images/avatar_components/${headOptions[headIndex]}.png`}
              alt="head"
              className="absolute w-full h-full object-contain"
              style={{ top: "-30%", position: "absolute", width: "50%", right: "25%" }}
            />
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
          </div>

          {/* Botão salvar */}
          <Button onClick={handleSave}>Salvar</Button>
        </div>
      </Modal>
    </>
  );
}
