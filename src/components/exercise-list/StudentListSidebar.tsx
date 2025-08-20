import { useState } from "react";
import { Search } from "lucide-react";
import { StudentAnswer } from "@/app/(admin)/(home)/exercise_list/correction/[id]/page"; 
import StudentListItem from "./StudentListItem";

type Props = {
  students: StudentAnswer[];
  selectedStudentIndex: number;
  onSelectStudent: (index: number) => void;
};

const StudentListSidebar = ({
  students,
  selectedStudentIndex,
  onSelectStudent,
}: Props) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStudents = students.filter((student) =>
    student.user_id.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <aside className="w-[320px] bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Alunos</h2>
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Buscar alunos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-100 border-none rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filteredStudents.map((student) => {
          const globalIndex = students.findIndex((s) => s._id === student._id);
          return (
            <StudentListItem
              key={student._id}
              student={student}
              isSelected={globalIndex === selectedStudentIndex}
              onClick={() => onSelectStudent(globalIndex)}
            />
          );
        })}
      </div>
    </aside>
  );
};

export default StudentListSidebar;
