import React, { useState, useMemo, useEffect } from "react";
import { IExercise } from "@/utils/interfaces/exercise.interface";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";

interface ExerciseSelectorProps {
  exercises: IExercise[];
  selectedExercises: string[];
  onSelect: (selectedIds: string[]) => void;
  disabled: boolean;
}

const ITEMS_PER_PAGE = 5;

const ExerciseSelector: React.FC<ExerciseSelectorProps> = ({
  exercises,
  selectedExercises,
  onSelect,
  disabled,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [localSelected, setLocalSelected] =
    useState<string[]>(selectedExercises);

  useEffect(() => {
    setLocalSelected(selectedExercises);
  }, [selectedExercises]);

  const handleSelect = (exerciseId: string) => {
    const newSelected = localSelected.includes(exerciseId)
      ? localSelected.filter((id) => id !== exerciseId)
      : [...localSelected, exerciseId];
    setLocalSelected(newSelected);
    onSelect(newSelected);
  };

  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) =>
      ex.statement.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [exercises, searchTerm]);

  const paginatedExercises = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredExercises.slice(startIndex, endIndex);
  }, [filteredExercises, currentPage]);

  const totalPages = Math.ceil(filteredExercises.length / ITEMS_PER_PAGE);

  return (
    <div className="space-y-4">

      <Input
        type="text"
        placeholder="Buscar exercícios..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1); 
        }}
        required={false}
      />

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
            {paginatedExercises.map((exercise) => (
              <tr key={exercise._id}>
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={localSelected.includes(exercise._id)}
                    onChange={() => handleSelect(exercise._id)}
                    disabled={disabled}
                    className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900"
                  />
                </td>
                <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="line-clamp-2">{exercise.statement}</div>
                </td>
              </tr>
            ))}
            {paginatedExercises.length === 0 && (
              <tr>
                <td
                  colSpan={2}
                  className="py-4 text-center text-sm text-gray-500"
                >
                  Nenhum exercício encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft size={16} /> Anterior
        </Button>
        <span className="text-sm text-gray-700 dark:text-gray-400">
          Página {currentPage} de {totalPages}
        </span>
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
        >
          Próximo <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
};

export default ExerciseSelector;
