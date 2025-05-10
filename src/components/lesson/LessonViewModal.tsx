"use client";

import React, { useEffect, useState } from "react";

import { HttpRequest } from "@/utils/http-request";
import { ILesson } from "@/utils/interfaces/lesson.interface";
import { IUserProgressWithUser } from "@/utils/interfaces/user-progress.interface";
import LessonDetails from "./completed/LessonDetails";
import LessonSidebar from "./completed/LessonSidebar";
import { Modal } from "@/components/ui/modal";

interface LessonViewModalProps {
    lesson: ILesson;  // Aqui você define o tipo de 'lesson'
    onClose: () => void;
}

const LessonViewModal: React.FC<LessonViewModalProps> = ({ lesson, onClose }) => {
    const [isOpen, setIsOpen] = useState(false);
    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const [userProgress, setUserProgress] = useState<IUserProgressWithUser[]>([]);

    useEffect(() => {
        async function fetchUserProgress() {
            const httpRequest = new HttpRequest();
            const response = await httpRequest.getUserProgressByLessonPlanAndType(lesson._id, 'LESSON');
            setUserProgress(response);
        }

        if (lesson._id) {
            fetchUserProgress();
        }

    }, [lesson._id]);

    return (
        <Modal isOpen={true} onClose={onClose} className="max-w-[800px] p-5 lg:p-10">
            <div className="h-[calc(100vh-150px)] overflow-hidden sm:h-[calc(100vh-174px)]">
                <div className="flex flex-col h-full gap-6 xl:flex-row xl:gap-5">
                    <LessonSidebar userProgress={userProgress} /> {/* Passando 'lesson' para o Sidebar */}
                    <LessonDetails userProgress={userProgress} />
                </div>
            </div>
        </Modal>
    );
};

export default LessonViewModal;
