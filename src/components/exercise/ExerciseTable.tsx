"use client";

import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";

import Button from "../ui/button/Button";
import ExerciseForm from "./ExerciseForm";
import { HttpRequest } from "@/utils/http-request";
import { IExercise } from "@/utils/interfaces/exercise.interface";

export default function ExerciseTable() {
  const [exercises, setExercises] = useState<IExercise[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<IExercise | null>(null);

  useEffect(() => {
    const fetchExercises = async () => {
      const httpRequest = new HttpRequest();
      const foundExercises = await httpRequest.getAllExercises();
      setExercises(foundExercises);
    };

    fetchExercises();
  }, []);

  function formatDate(dateString?: string): string {

    if (!dateString) {
      return "Sem data de entrega";
    }

    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR"); // dd/mm/aaaa
  }

  const handleEdit = (exercise: IExercise) => {
    setSelectedExercise(exercise); // Atribui a aula selecionada
    setIsModalOpen(true); // Abre o modal de edição
  };

  const handleDelete = async (exerciseId: string) => {
    try {
      const httpRequest = new HttpRequest();
      await httpRequest.removeExercise(exerciseId); // Deleta a aula com o id passado
      setExercises(exercises.filter((exercise) => exercise._id !== exerciseId)); // Atualiza a lista de aulas
    } catch (error) {
      console.error("Erro ao deletar aula:", error);
    }
  };

  const closeModal = () => {
    setSelectedExercise(null); 
    setIsModalOpen(false);
    window.location.reload();
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500 dark:text-gray-400">Enunciado</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500 dark:text-gray-400">Exibir Resposta</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500 dark:text-gray-400">Data de Entrega</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500 dark:text-gray-400">Nota</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500 dark:text-gray-400">Pontos</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500 dark:text-gray-400">Tipo</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500 dark:text-gray-400">Ações</TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {exercises.map((exercise) => (
              <TableRow key={exercise._id}>
                <TableCell className="px-5 py-4 text-start text-gray-800 text-theme-sm dark:text-white/90">{exercise.statement}</TableCell>
                <TableCell className="px-4 py-3 text-start text-gray-500 text-theme-sm dark:text-gray-400">{exercise.showAnswer}</TableCell>
                <TableCell className="px-4 py-3 text-start text-gray-500 text-theme-sm dark:text-gray-400">{formatDate(exercise.due_date)}</TableCell>
                <TableCell className="px-4 py-3 text-start text-gray-500 text-theme-sm dark:text-gray-400">{exercise.grade}</TableCell>
                <TableCell className="px-4 py-3 text-start text-gray-500 text-theme-sm dark:text-gray-400">{exercise.points}</TableCell>
                <TableCell className="px-4 py-3 text-start text-gray-500 text-theme-sm dark:text-gray-400">{exercise.type}</TableCell>
                <TableCell className="px-4 py-3 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                  <Button size="sm" className="mr-2" onClick={() => handleEdit(exercise)}>Editar</Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(exercise._id)}>Deletar</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Modal de Cadastro/Edição */}
      {isModalOpen && selectedExercise && (
        <ExerciseForm
          initialData={selectedExercise}
          reloadOnSubmit={false}
          onCreated={(exerciseId) => {
            setExercises((prevExercises) =>
              prevExercises.map((exercise) =>
                exercise._id === exerciseId ? { ...exercise, ...selectedExercise } : exercise
              )
            );
            closeModal();
          }}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}

