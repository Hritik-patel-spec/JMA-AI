"use client";
import { useState } from "react";
import { FiSend } from "react-icons/fi";
import VoiceRecorder from "./VoiceRecorder";

interface Props {
  messages: Array<{ role: string; content: string }>;
  onSendMessage: (text: string) => void;
}

export default function ChatArea({ messages, onSendMessage }: Props) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input);
    setInput("");
  };

  return (
    <main className="flex-1 flex flex-col justify-between items-center p-6 relative">
      <header className="w-full flex justify-between items-center max-w-4xl">
        <div className="text-xl font-semibold flex items-center gap-2 text-gray-300">
          <span className="text-blue-400">✦</span> Sylvia <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded">Jesus & Mary AI Teacher</span>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 w-full max-w-3xl overflow-y-auto my-4 space-y-4 px-2">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <h1 className="text-4xl font-medium text-gray-200 mb-2">Where should we start?</h1>
            <p className="text-gray-400 text-sm">Ask Sylvia anything about your school syllabus or homework.</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xl p-4 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-[#1e1f20] text-gray-200 border border-gray-700'}`}>
                {msg.content}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Gemini Style Input */}
      <div className="w-full max-w-3xl bg-[#1e1f20] border border-gray-700/60 rounded-3xl p-3 px-5 shadow-lg">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
          placeholder="Ask Sylvia..."
          className="w-full bg-transparent resize-none outline-none text-white placeholder-gray-500 pr-16"
          rows={1}
        />
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs bg-[#282a2c] px-2.5 py-1 rounded-md text-gray-400">Flash Extended</span>
          <div className="flex items-center gap-3">
            <VoiceRecorder onTranscript={(text) => setInput(text)} />
            <button onClick={handleSend} className="bg-blue-600 hover:bg-blue-500 text-white p-2.5 rounded-full">
              <FiSend />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}