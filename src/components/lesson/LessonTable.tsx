"use client";

import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";

import Button from "../ui/button/Button";
import { HttpRequest } from "@/utils/http-request";
import { ILesson } from "@/utils/interfaces/lesson.interface";
import LessonForm from "./LessonForm";

export default function LessonTable() {
  const [lessons, setLessons] = useState<ILesson[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<ILesson | null>(null);

  useEffect(() => {
    const fetchLessons = async () => {
      const httpRequest = new HttpRequest();
      const foundLessons = await httpRequest.getAllLessons();
      setLessons(foundLessons);
    };

    fetchLessons();
  }, []);

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR"); // dd/mm/aaaa
  }

  const handleEdit = (lesson: ILesson) => {
    setSelectedLesson(lesson); // Atribui a aula selecionada
    setIsModalOpen(true); // Abre o modal de edição
  };

  const handleDelete = async (lessonId: string) => {
    try {
      const httpRequest = new HttpRequest();
      await httpRequest.removeLesson(lessonId); // Deleta a aula com o id passado
      setLessons(lessons.filter((lesson) => lesson._id !== lessonId)); // Atualiza a lista de aulas
    } catch (error) {
      console.error("Erro ao deletar aula:", error);
    }
  };

  const closeModal = () => {
    setSelectedLesson(null); // Limpa a aula selecionada
    setIsModalOpen(false); // Fecha o modal de edição
    window.location.reload();
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500 dark:text-gray-400">Nome</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500 dark:text-gray-400">Data de Entrega</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500 dark:text-gray-400">Nota</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500 dark:text-gray-400">Links</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500 dark:text-gray-400">Pontos</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500 dark:text-gray-400">Tipo</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500 dark:text-gray-400">Ações</TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {lessons.map((lesson) => (
              <TableRow key={lesson._id}>
                <TableCell className="px-5 py-4 text-start text-gray-800 text-theme-sm dark:text-white/90">{lesson.name}</TableCell>
                <TableCell className="px-4 py-3 text-start text-gray-500 text-theme-sm dark:text-gray-400">{formatDate(lesson.due_date)}</TableCell>
                <TableCell className="px-4 py-3 text-start text-gray-500 text-theme-sm dark:text-gray-400">{lesson.grade}</TableCell>
                <TableCell className="px-4 py-3 text-start text-gray-500 text-theme-sm dark:text-gray-400">{lesson.links}</TableCell>
                <TableCell className="px-4 py-3 text-start text-gray-500 text-theme-sm dark:text-gray-400">{lesson.points}</TableCell>
                <TableCell className="px-4 py-3 text-start text-gray-500 text-theme-sm dark:text-gray-400">{lesson.type}</TableCell>
                <TableCell className="px-4 py-3 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                  <Button size="sm" className="mr-2" onClick={() => handleEdit(lesson)}>Editar</Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(lesson._id)}>Deletar</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Modal de Cadastro/Edição */}
      {isModalOpen && selectedLesson && (
        <LessonForm
          initialData={selectedLesson}
          reloadOnSubmit={false}
          onCreated={(lessonId) => {
            setLessons((prevLessons) =>
              prevLessons.map((lesson) =>
                lesson._id === lessonId ? { ...lesson, ...selectedLesson } : lesson
              )
            ); // Atualiza a lista de aulas com os dados editados
            setIsModalOpen(false);
          }}
          onClose={() => closeModal()}
        />
      )}
    </div>
  );
}

