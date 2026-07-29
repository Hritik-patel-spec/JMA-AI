"use client";
import { FiX, FiDownload } from "react-icons/fi";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onDownloadPDF: () => void;
}

export default function SettingsModal({ isOpen, onClose, onDownloadPDF }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-[#1e1f20] w-full max-w-md p-6 rounded-2xl border border-gray-800 text-white relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <FiX className="text-xl" />
        </button>
        <h3 className="text-xl font-semibold mb-4">Settings & Personalization</h3>
        
        <div className="space-y-4 text-sm">
          <div>
            <label className="block text-gray-400 mb-1">AI Voice Model</label>
            <select className="w-full bg-[#131314] p-2.5 border border-gray-700 rounded-xl outline-none">
              <option>Cartesia - Sonic (Female Teacher Voice)</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-400 mb-1">Export Data</label>
            <button onClick={onDownloadPDF} className="flex items-center gap-2 w-full justify-center bg-blue-600 hover:bg-blue-500 p-2.5 rounded-xl font-medium">
              <FiDownload /> Download My Chat PDF History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}