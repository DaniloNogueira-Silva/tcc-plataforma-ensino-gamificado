type Props = {
  currentTotalGrade: number;
  totalPoints: number;
};

const CurrentGradeCard = ({ currentTotalGrade, totalPoints }: Props) => {
  const percentage =
    totalPoints > 0 ? (currentTotalGrade / totalPoints) * 100 : 0;

  return (
    <div className="p-4 border border-gray-200 rounded-lg">
      <h4 className="font-semibold text-gray-800 mb-2">Nota Atual</h4>
      <p className="text-5xl font-bold text-gray-900">
        {currentTotalGrade.toFixed(1).replace(".", ",")}
      </p>
      <p className="text-sm text-gray-500 mb-3">
        de {totalPoints.toFixed(1).replace(".", ",")} pontos
      </p>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div
          className="bg-blue-600 h-2 rounded-full"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <p className="text-right text-sm text-gray-600">
        {percentage.toFixed(1)}%
      </p>
    </div>
  );
};

export default CurrentGradeCard;
