"use client";

import LessonForm from "@/components/lesson/LessonForm";
import LessonTable from "@/components/lesson/LessonTable";
import { Modal } from "@/components/ui/modal";
import { useState } from "react";

const Lessons = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <div className="flex w-full flex-col gap-5">
      <div className="mt-3 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Aulas</h1>
        <button
          className="rounded-lg bg-brand-500 px-4 py-2 text-white transition hover:bg-brand-600"
          onClick={() => setIsFormOpen(true)}
        >
          Criar aula
        </button>
      </div>

      <div className="space-y-6 mt-5">
        <LessonTable />
      </div>
      
      {isFormOpen && (
        <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)}>
          <div className="max-w-[584px] p-5 lg:p-10 mx-auto">
            <h3 className="mb-4 text-xl font-bold">Criar Aula</h3>
            <LessonForm
              reloadOnSubmit={true}
              onClose={() => setIsFormOpen(false)}
            />
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Lessons;
