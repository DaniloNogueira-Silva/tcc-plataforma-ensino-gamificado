"use client";

import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Button from "../ui/button/Button";
import { HttpRequest } from "@/utils/http-request";
import { IAvatar } from "@/utils/interfaces/avatar.interface";
import { Modal } from "../ui/modal";
import { useModal } from "../../hooks/useModal";

export default function UserAvatarCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const http = useMemo(() => new HttpRequest(), []);

  const [torsoOptions, setTorsoOptions] = useState<string[]>([]);
  const [headOptions, setHeadOptions] = useState<string[]>([]);
  const [armOptions, setArmOptions] = useState<string[]>([]);

  const [torsoIndex, setTorsoIndex] = useState(0);
  const [headIndex, setHeadIndex] = useState(0);
  const [armIndex, setArmIndex] = useState(0);

  const [savedTorso, setSavedTorso] = useState("");
  const [savedHead, setSavedHead] = useState("");
  const [savedArm, setSavedArm] = useState("");

  const [avatarFromApi, setAvatarFromApi] = useState<IAvatar | null>(null);

  useEffect(() => {
    async function loadAvatar() {
      try {
        const [avatar, allItems, userChar] = await Promise.all([
          http.getAvatarByUserId(),
          http.getAllItems(),
          http.getUserCharacter(),
        ]);

        let torso: string[] = [];
        let head: string[] = [];
        let arm: string[] = [];

        if (userChar && userChar.items) {
          const purchased = allItems.filter((item) =>
            userChar.items?.includes(item._id)
          );
          torso = purchased
            .filter((i) => i.label.includes("armor"))
            .map((i) => i.label);
          head = purchased
            .filter((i) => i.label.includes("helmet"))
            .map((i) => i.label);
          arm = purchased
            .filter((i) => i.label.includes("arm"))
            .map((i) => i.label);

          setTorsoOptions(torso);
          setHeadOptions(head);
          setArmOptions(arm);
        }

        if (avatar) {
          setAvatarFromApi(avatar);
          setSavedTorso(avatar.torso);
          setSavedHead(avatar.head);
          setSavedArm(avatar.arm);

          const torsoIdx = torso.indexOf(avatar.torso);
          const headIdx = head.indexOf(avatar.head);
          const armIdx = arm.indexOf(avatar.arm);
          if (torsoIdx !== -1) setTorsoIndex(torsoIdx);
          if (headIdx !== -1) setHeadIndex(headIdx);
          if (armIdx !== -1) setArmIndex(armIdx);
        } else {
          if (torso.length) setSavedTorso(torso[0]);
          if (head.length) setSavedHead(head[0]);
          if (arm.length) setSavedArm(arm[0]);
        }
      } catch (error) {
        console.error("Erro ao carregar avatar no componente:", error);
      }
    }

    loadAvatar();
  }, [http]);

  const changeIndex = (
    currentIndex: number,
    setIndex: React.Dispatch<React.SetStateAction<number>>,
    options: string[],
    direction: "prev" | "next"
  ) => {
    if (options.length === 0) return;
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
        savedAvatar = await http.updateAvatar({
          id: avatarFromApi.id,
          ...avatarToSave,
        });
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

  const AvatarDisplay = ({
    torso,
    head,
    arm,
  }: {
    torso: string;
    head: string;
    arm: string;
  }) => (
    <div className="relative w-56 h-56">
      <Image
        src={`/images/avatar_components/${arm}.png`}
        alt="left arm"
        className="absolute w-full h-full object-contain"
        style={{ top: "33%", left: "-5%", width: "62%" }}
      />
      <Image
        src={`/images/avatar_components/${arm}.png`}
        alt="right arm"
        className="absolute w-full h-full object-contain"
        style={{
          top: "33%",
          right: "-6%",
          width: "62%",
          transform: "scaleX(-1)",
        }}
      />
      <Image
        src={`/images/avatar_components/${torso}.png`}
        alt="torso"
        className="absolute w-full h-full object-contain"
        style={{ top: "17%", right: "4.5%", width: "90%" }}
      />
      <Image
        src={`/images/avatar_components/${head}.png`}
        alt="head"
        className="absolute w-full h-full object-contain"
        style={{ top: "-30%", right: "25%", width: "50%" }}
      />
    </div>
  );

  return (
    <>
      <div className="p-4 border border-gray-200 rounded-2xl dark:border-gray-800 w-full max-w-sm flex flex-col items-center gap-4">
        <AvatarDisplay torso={savedTorso} head={savedHead} arm={savedArm} />
        <Button onClick={openModal} className="relative z-10">
          {" "}
          Editar Avatar
        </Button>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-md m-4">
        <div className="w-full max-w-md rounded-3xl bg-white p-6 dark:bg-gray-900 flex flex-col gap-6 items-center">
          <AvatarDisplay
            torso={torsoOptions[torsoIndex] || ""}
            head={headOptions[headIndex] || ""}
            arm={armOptions[armIndex] || ""}
          />

          <div className="flex flex-col gap-4 w-full">
            <div className="flex justify-between items-center">
              <span className="text-sm">Cabeça</span>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    changeIndex(headIndex, setHeadIndex, headOptions, "prev")
                  }
                >
                  ←
                </button>
                <button
                  onClick={() =>
                    changeIndex(headIndex, setHeadIndex, headOptions, "next")
                  }
                >
                  →
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm">Torso</span>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    changeIndex(torsoIndex, setTorsoIndex, torsoOptions, "prev")
                  }
                >
                  ←
                </button>
                <button
                  onClick={() =>
                    changeIndex(torsoIndex, setTorsoIndex, torsoOptions, "next")
                  }
                >
                  →
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm">Braços</span>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    changeIndex(armIndex, setArmIndex, armOptions, "prev")
                  }
                >
                  ←
                </button>
                <button
                  onClick={() =>
                    changeIndex(armIndex, setArmIndex, armOptions, "next")
                  }
                >
                  →
                </button>
              </div>
            </div>
          </div>

          <Button onClick={handleSave}>Salvar</Button>
        </div>
      </Modal>
    </>
  );
}
