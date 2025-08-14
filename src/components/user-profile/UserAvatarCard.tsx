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
  const [armIndex, setArmIndex] = useState(0); // Já existia, agora será usado

  // Estados para opções salvas e exibidas fora da modal
  const [savedTorso, setSavedTorso] = useState(torsoOptions[0]);
  const [savedHead, setSavedHead] = useState(headOptions[0]);
  const [savedArm, setSavedArm] = useState(armOptions[0]); // Já existia, agora será usado

  // Guarda avatar salvo retornado da API
  const [avatarFromApi, setAvatarFromApi] = useState<IAvatar | null>(null);

  useEffect(() => {
    async function loadAvatar() {
      try {
        const avatar = await http.getAvatarByUserId();
        if (avatar) {
          setAvatarFromApi(avatar);

          // Atualiza os estados salvos
          setSavedTorso(avatar.torso);
          setSavedHead(avatar.head);
          setSavedArm(avatar.arm); // <-- ADICIONADO AQUI

          // Atualiza os estados da modal
          const torsoIdx = torsoOptions.indexOf(avatar.torso);
          const headIdx = headOptions.indexOf(avatar.head);
          const armIdx = armOptions.indexOf(avatar.arm); // <-- ADICIONADO AQUI
          if (torsoIdx !== -1) setTorsoIndex(torsoIdx);
          if (headIdx !== -1) setHeadIndex(headIdx);
          if (armIdx !== -1) setArmIndex(armIdx); // <-- ADICIONADO AQUI
        }
      } catch (error) {
        console.error("Erro ao carregar avatar no componente:", error);
      }
    }

    loadAvatar();
  }, []); // O array de dependências vazio está correto aqui

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
      arm: armOptions[armIndex],
    };

    try {
      let savedAvatar: IAvatar | null = null;
      if (!avatarFromApi) {
        savedAvatar = await http.createAvatar(avatarToSave);
      } else {
        savedAvatar = await http.updateAvatar({ id: avatarFromApi.id, ...avatarToSave });
      }

      if (savedAvatar) {
        setAvatarFromApi(savedAvatar);
        setSavedTorso(savedAvatar.torso);
        setSavedHead(savedAvatar.head);
        setSavedArm(savedAvatar.arm);
        closeModal();
      }
    } catch (error) {
      console.error("Erro ao salvar avatar:", error);
    }
  }

  const AvatarDisplay = ({ torso, head, arm }: { torso: string; head: string; arm: string }) => (
    <div className="relative w-56 h-56">
      {/* Braços renderizados primeiro para ficarem atrás do torso */}
      {/* Braço Esquerdo (imagem original) */}
      <img
        src={`/images/avatar_components/${arm}.png`}
        alt="left arm"
        className="absolute w-full h-full object-contain"
        style={{ top: "33%", left: "-5%", width: "62%" }}
      />
      {/* Braço Direito (imagem espelhada) */}
      <img
        src={`/images/avatar_components/${arm}.png`}
        alt="right arm"
        className="absolute w-full h-full object-contain"
        style={{ top: "33%", right: "-6%", width: "62%", transform: "scaleX(-1)" }}
      />
      {/* Torso */}
      <img
        src={`/images/avatar_components/${torso}.png`}
        alt="torso"
        className="absolute w-full h-full object-contain"
        style={{ top: "17%", right: "4.5%", width: "90%" }}
      />
      {/* Cabeça */}
      <img
        src={`/images/avatar_components/${head}.png`}
        alt="head"
        className="absolute w-full h-full object-contain"
        style={{ top: "-30%", right: "25%", width: "50%" }}
      />
    </div>
  );

  return (
    <>
      {/* Card de exibição do avatar salvo */}
      <div className="p-4 border border-gray-200 rounded-2xl dark:border-gray-800 w-full max-w-sm flex flex-col items-center gap-4">
        <AvatarDisplay torso={savedTorso} head={savedHead} arm={savedArm} />
        <Button onClick={openModal} className="relative z-10"> {/* <-- ALTERAÇÃO AQUI */}
          Editar Avatar
        </Button>
      </div>

      {/* Modal de edição */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-md m-4">
        <div className="w-full max-w-md rounded-3xl bg-white p-6 dark:bg-gray-900 flex flex-col gap-6 items-center">
          <AvatarDisplay
            torso={torsoOptions[torsoIndex]}
            head={headOptions[headIndex]}
            arm={armOptions[armIndex]}
          />

          {/* Controles de edição */}
          <div className="flex flex-col gap-4 w-full">
            {/* Controle da Cabeça */}
            <div className="flex justify-between items-center">
              <span className="text-sm">Cabeça</span>
              <div className="flex gap-2">
                <button onClick={() => changeIndex(headIndex, setHeadIndex, headOptions, "prev")}>←</button>
                <button onClick={() => changeIndex(headIndex, setHeadIndex, headOptions, "next")}>→</button>
              </div>
            </div>

            {/* Controle do Torso */}
            <div className="flex justify-between items-center">
              <span className="text-sm">Torso</span>
              <div className="flex gap-2">
                <button onClick={() => changeIndex(torsoIndex, setTorsoIndex, torsoOptions, "prev")}>←</button>
                <button onClick={() => changeIndex(torsoIndex, setTorsoIndex, torsoOptions, "next")}>→</button>
              </div>
            </div>

            {/* Controle dos Braços - ADICIONADO */}
            <div className="flex justify-between items-center">
              <span className="text-sm">Braços</span>
              <div className="flex gap-2">
                <button onClick={() => changeIndex(armIndex, setArmIndex, armOptions, "prev")}>←</button>
                <button onClick={() => changeIndex(armIndex, setArmIndex, armOptions, "next")}>→</button>
              </div>
            </div>
          </div>

          <Button onClick={handleSave}>Salvar</Button>
        </div>
      </Modal>
    </>
  );
}