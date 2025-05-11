"use client";

import React, { useEffect, useState } from "react";

import ExerciseDetails from "./completed/ExerciseDetails";
import ExerciseSidebar from "./completed/ExerciseSidebar";
import { HttpRequest } from "@/utils/http-request";
import { IExercise } from "@/utils/interfaces/exercise.interface";
import { IUserProgressWithUser } from "@/utils/interfaces/user-progress.interface";
import { Modal } from "@/components/ui/modal";

interface ExerciseViewModalProps {
    exercise: IExercise;  // Aqui você define o tipo de 'exercise'
    onClose: () => void;
}

const ExerciseViewModal: React.FC<ExerciseViewModalProps> = ({ exercise, onClose }) => {
    const [userProgress, setUserProgress] = useState<IUserProgressWithUser[]>([]);
    const [selectedUserProgress, setSelectedUserProgress] = useState<IUserProgressWithUser | null>(null);

    useEffect(() => {
        async function fetchUserProgress() {
            const httpRequest = new HttpRequest();
            const response = await httpRequest.getUserProgressByLessonPlanAndType(exercise._id, "EXERCISE");
            setUserProgress(response);
            if (response.length > 0) setSelectedUserProgress(response[0]);
        }

        if (exercise._id) {
            fetchUserProgress();
        }
    }, [exercise._id]);

    return (
        <Modal isOpen={true} onClose={onClose} className="max-w-[800px] p-5 lg:p-10">
            <div className="h-[calc(100vh-150px)] overflow-hidden sm:h-[calc(100vh-174px)]">
                <div className="flex flex-col h-full gap-6 xl:flex-row xl:gap-5">
                    <ExerciseSidebar userProgress={userProgress} onSelect={setSelectedUserProgress} />
                    <ExerciseDetails userProgress={selectedUserProgress} />
                </div>
            </div>
        </Modal>
    );
};

export default ExerciseViewModal;
