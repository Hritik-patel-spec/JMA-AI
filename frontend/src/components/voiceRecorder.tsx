"use client";
import { useState } from "react";
import { FiMic, FiSquare } from "react-icons/fi";

interface Props {
  onTranscript: (text: string) => void;
}

export default function VoiceRecorder({ onTranscript }: Props) {
  const [recording, setRecording] = useState(false);

  const toggleRecording = () => {
    if (!recording) {
      setRecording(true);
      // Deepgram Realtime Audio Capture simulation endpoint hook
      setTimeout(() => {
        onTranscript("Explain Newton's third law of motion");
        setRecording(false);
      }, 3000);
    } else {
      setRecording(false);
    }
  };

  return (
    <button onClick={toggleRecording} className={`p-2.5 rounded-full transition ${recording ? 'bg-red-600 text-white animate-pulse' : 'text-gray-400 hover:text-white hover:bg-gray-700/40'}`}>
      {recording ? <FiSquare /> : <FiMic className="text-lg" />}
    </button>
  );
}