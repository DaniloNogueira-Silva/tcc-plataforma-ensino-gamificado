"use client";

import Button from "../ui/button/Button";
import Image from "next/image";
import { Modal } from "../ui/modal";
import React from "react";
import { useModal } from "../../hooks/useModal";

export default function UserAvatarCard() {
  const { isOpen, openModal, closeModal } = useModal();

  const avatarUrl = `https://avataaars.io/?avatarStyle=Circle&topType=LongHairMiaWallace&accessoriesType=Prescription02&hairColor=BrownDark&facialHairType=Blank&clotheType=Hoodie&clotheColor=PastelBlue&eyeType=Happy&eyebrowType=Default&mouthType=Smile&skinColor=Light`;

  return (
    <>
      <div className="p-4 border border-gray-200 rounded-2xl dark:border-gray-800 w-full max-w-sm flex flex-col items-center gap-4">
        <div className="w-40 h-40 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
          <img
            src={avatarUrl}
            alt="user avatar"
            className="w-full h-full object-contain"
          />
        </div>

        <Button onClick={openModal}>Editar Avatar</Button>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-md m-4">
        <div className="relative w-full max-w-md rounded-3xl bg-white p-6 dark:bg-gray-900 flex justify-center">
          <div className="w-56 h-56 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
            <img
              src={avatarUrl}
              width={224}
              height={224}
              alt="user avatar modal"
              className="object-contain w-full h-full"
            />
          </div>
        </div>
      </Modal>
    </>
  );
}
