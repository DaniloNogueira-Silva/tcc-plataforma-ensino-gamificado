"use client";

import Link from "next/link"; 

type ExerciseCardProps = {
  exerciseId: string;
  statement: string;
  dueDate: string;
};

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exerciseId, statement, dueDate }) => {
  const formattedDueDate = dueDate ? new Date(dueDate).toISOString().split("T")[0] : "";

  return (
    <Link href={`/exercise/realize/${exerciseId}`} passHref>
      <div
        className="relative group rounded-2xl border border-gray-200 bg-white px-6 pb-5 pt-6 overflow-hidden transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-white/[0.03]"
      >
        <div className="mb-6 z-10 relative">
          <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
            {statement}
          </h3>
          <span className="block text-sm text-gray-600 dark:text-gray-400">
            Data de entrega: {formattedDueDate}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ExerciseCard;
