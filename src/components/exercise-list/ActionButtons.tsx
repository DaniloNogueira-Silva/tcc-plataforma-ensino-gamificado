import { Edit } from "lucide-react";

type Props = {
  isGraded: boolean;
  isEditingMode: boolean;
  isSubmitting: boolean;
  onEdit: () => void;
  onSubmit: (goToNext?: boolean) => void;
};

const ActionButtons = ({
  isGraded,
  isEditingMode,
  isSubmitting,
  onEdit,
  onSubmit,
}: Props) => {
  return (
    <div className="mt-auto flex flex-col space-y-3">
      {isGraded && !isEditingMode ? (
        <button
          onClick={onEdit}
          className="w-full py-3 bg-yellow-500 text-white rounded-lg font-bold hover:bg-yellow-600 flex items-center justify-center gap-2"
        >
          <Edit size={16} />
          Editar Notas
        </button>
      ) : (
        <>
          <button
            onClick={() => onSubmit(false)}
            disabled={isSubmitting}
            className="w-full py-3 bg-white border border-gray-300 rounded-lg font-bold text-gray-800 hover:bg-gray-50 disabled:opacity-50"
          >
            {isSubmitting ? "Salvando..." : "Salvar Progresso"}
          </button>
          <button
            onClick={() => onSubmit(true)}
            disabled={isSubmitting}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? "Salvando..." : "Salvar e Próximo Aluno"}
          </button>
        </>
      )}
    </div>
  );
};

export default ActionButtons;
