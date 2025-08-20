type Props = {
  totalQuestions: number;
};

const CorrectionProgressCard = ({ totalQuestions }: Props) => {
  return (
    <div className="p-4 border border-gray-200 rounded-lg">
      <h4 className="font-semibold text-gray-800 mb-3">
        Progresso da Correção
      </h4>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div
          className="bg-blue-600 h-2 rounded-full"
          style={{ width: `100%` }}
        ></div>
      </div>
      <p className="text-right text-sm text-gray-600">
        Questões corrigidas {totalQuestions}/{totalQuestions}
      </p>
    </div>
  );
};

export default CorrectionProgressCard;
