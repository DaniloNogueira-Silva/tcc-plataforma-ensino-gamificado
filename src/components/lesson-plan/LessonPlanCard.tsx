import { ArrowDownIcon, ArrowUpIcon } from "../../icons";

import Badge from "../ui/badge/Badge";
import Image from "next/image";
import ProgressBar from "../progress-bar/ProgressBar";

type LessonPlanCardProps = {
  imgUrl: string;
  lessonPlanName: string;
  progress: number;
  teacherName: string;
};

// Component rendering
const LessonPlanCard: React.FC<LessonPlanCardProps> = ({
  imgUrl,
  lessonPlanName,
  progress,
  teacherName,
}) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-6 pb-5 pt-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10">
          <Image
            width={40}
            height={40}
            className="w-full"
            src={imgUrl}
            alt={lessonPlanName}
          />
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
            {lessonPlanName}
          </h3>
          <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
            {teacherName}
          </span>
        </div>
      </div>
      <div className="space-y-5 sm:max-w-[320px] w-full">
        <ProgressBar progress={progress} size="lg" label="inside" />
      </div>
    </div>
  );
};

export default LessonPlanCard;
