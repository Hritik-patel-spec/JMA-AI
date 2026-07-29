"use client";
import { FiPlus, FiMessageSquare, FiSettings } from "react-icons/fi";

interface Props {
  onNewChat: () => void;
  openSettings: () => void;
  studentName: string;
}

export default function Sidebar({ onNewChat, openSettings, studentName }: Props) {
  return (
    <aside className="w-64 bg-[#1e1f20] flex flex-col justify-between p-4 border-r border-gray-800">
      <div>
        <button onClick={onNewChat} className="flex items-center gap-3 w-full bg-[#282a2c] hover:bg-[#333538] text-white p-3 rounded-full text-sm font-medium transition">
          <FiPlus className="text-lg" /> New chat
        </button>

        <div className="mt-6">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">Recents</h2>
          <div className="space-y-1">
            <div className="flex items-center gap-2 p-2 hover:bg-[#282a2c] rounded-lg text-sm text-gray-300 cursor-pointer">
              <FiMessageSquare /> Math Doubts Chapter 3
            </div>
            <div className="flex items-center gap-2 p-2 hover:bg-[#282a2c] rounded-lg text-sm text-gray-300 cursor-pointer">
              <FiMessageSquare /> Science Experiment Help
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800 pt-3">
        <div className="flex items-center justify-between w-full p-2 hover:bg-[#282a2c] rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center font-bold text-white text-sm">
              {studentName[0] || "S"}
            </div>
            <span className="text-sm font-medium truncate">{studentName}</span>
          </div>
          <FiSettings onClick={openSettings} className="text-gray-400 cursor-pointer hover:text-white text-lg" />
        </div>
      </div>
    </aside>
  );
}