type Props = {
  totalCount: number;
  correctedCount: number;
  title: string;
  label: string;
};

const CorrectionProgressCard = ({
  totalCount,
  correctedCount,
  title,
  label,
}: Props) => {
  const progressPercentage =
    totalCount > 0 ? (correctedCount / totalCount) * 100 : 0;

  return (
    <div className="p-4 border border-gray-200 rounded-lg">
      <h4 className="font-semibold text-gray-800 mb-3">{title}</h4>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      <p className="text-right text-sm text-gray-600">
        {label} {correctedCount}/{totalCount}
      </p>
    </div>
  );
};

export default CorrectionProgressCard;
