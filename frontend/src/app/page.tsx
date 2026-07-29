"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  LogOut,
  MessageSquare,
  Plus,
  Send,
  Sparkles,
  Bot,
  Sun,
  Moon,
  Settings,
  X,
  PhoneOff,
  ChevronDown,
  Activity,
  Menu,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Check
} from "lucide-react";

interface UserProfile {
  name: string;
  class: string;
  rollNo: string;
  phone: string;
  email: string;
}

interface Message {
  sender: "user" | "ai";
  message: string;
}

interface ChatSession {
  sessionId: string;
  title: string;
  messages: Message[];
  type?: "chat" | "voice";
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  
  // Chat & History States
  const [currentSessionId, setCurrentSessionId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatHistoryList, setChatHistoryList] = useState<ChatSession[]>([]);
  const [voiceHistoryList, setVoiceHistoryList] = useState<ChatSession[]>([]);
  const [activeTab, setActiveTab] = useState<"chat" | "voice">("chat");

  const [inputPrompt, setInputPrompt] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<string>("Flash-Lite");
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState<boolean>(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Voice Playground States
  const [isVoiceMode, setIsVoiceMode] = useState<boolean>(false);
  const [audioLevel, setAudioLevel] = useState<number>(10);
  const [liveTranscript, setLiveTranscript] = useState<string>("Listening... Go ahead! ✨");
  const [currentVoiceSessionId, setCurrentVoiceSessionId] = useState<string>("");

  // UI Customization States
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [fontFamily, setFontFamily] = useState<string>("font-sans");
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    if (!loading) {
      inputRef.current?.focus();
    }
  }, [messages, loading]);

  useEffect(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("jma_user");
    if (!storedUser) {
      router.push("/login");
      return;
    }

    try {
      const parsedUser: UserProfile = JSON.parse(storedUser);
      setUser(parsedUser);
      const userKey = parsedUser.phone || parsedUser.email;
      
      const newChatId = "chat_" + Date.now();
      const newVoiceId = "voice_" + Date.now();
      setCurrentSessionId(newChatId);
      setCurrentVoiceSessionId(newVoiceId);

      fetchUserHistory(userKey);
    } catch (e) {
      router.push("/login");
    }

    const savedTheme = localStorage.getItem("jma_theme") as "dark" | "light";
    if (savedTheme) setTheme(savedTheme);

    const savedFont = localStorage.getItem("jma_font");
    if (savedFont) setFontFamily(savedFont);
  }, []);

  const fetchUserHistory = async (userKey: string) => {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/chat/history?userKey=${encodeURIComponent(userKey)}`
      );
      const data = await res.json();
      if (data.sessions) {
        setChatHistoryList(data.sessions.filter((s: any) => s.type !== "voice"));
        setVoiceHistoryList(data.sessions.filter((s: any) => s.type === "voice"));
      } else if (data.history) {
        setChatHistoryList(data.history);
      }
    } catch (err) {
      console.error("Failed to load history", err);
    }
  };

  // 100% Free Indian Female Voice Search & Speech Synthesis
  const speakInVoiceMode = (text: string, langCode: string = "hi-IN") => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    const cleanText = text
      .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, "")
      .replace(/[*_~`#]/g, "")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = langCode;
    utterance.rate = 0.95;
    utterance.pitch = 1.05;

    const voices = window.speechSynthesis.getVoices();
    
    // Strict Indian Female Voice Filtering (hi-IN / en-IN)
    const targetVoice = voices.find((voice) => {
      const name = voice.name.toLowerCase();
      const lang = voice.lang.toLowerCase();
      
      const isIndian = lang.includes("hi-in") || lang.includes("en-in");
      
      const isFemale = 
        name.includes("female") || 
        name.includes("swara") || 
        name.includes("kalpana") || 
        name.includes("lekha") || 
        name.includes("heera") || 
        name.includes("google");

      const isMale = 
        name.includes("male") || 
        name.includes("rishi") || 
        name.includes("hemant") || 
        name.includes("rahul") ||
        name.includes("david");

      return isIndian && isFemale && !isMale;
    }) || voices.find((voice) => voice.lang.toLowerCase().includes("hi-in") && !voice.name.toLowerCase().includes("male"))
       || voices.find((voice) => !voice.name.toLowerCase().includes("male"));

    if (targetVoice) {
      utterance.voice = targetVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  };

  const startVoiceMode = () => {
    setIsVoiceMode(true);
    setLiveTranscript("Listening... Go ahead! ✨");

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (interimTranscript) {
        setLiveTranscript(interimTranscript);
        setAudioLevel(Math.floor(Math.random() * 40) + 20);
      }

      if (finalTranscript) {
        const isEnglish = /^[A-Za-z0-9\s.,?!'-]+$/.test(finalTranscript.trim());
        const detectedLang = isEnglish ? "en-US" : "hi-IN";
        
        handleVoiceInteraction(finalTranscript, detectedLang);
      }
    };

    try {
      recognition.start();
    } catch (e) {
      console.error(e);
    }
  };

  const stopVoiceMode = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setIsVoiceMode(false);
    setAudioLevel(10);
  };

  const handleVoiceInteraction = async (spokenText: string, langCode: string) => {
    if (!user) return;
    setLiveTranscript(`You: "${spokenText}"`);

    try {
      const userKey = user.phone || user.email;
      const res = await fetch("http://127.0.0.1:8000/api/chat/save-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userKey,
          sessionId: currentVoiceSessionId,
          type: "voice",
          messages: [{ sender: "user", message: spokenText }]
        }),
      });
      const data = await res.json();
      const replyText = data.reply || data.message || "I am here to assist you!";

      setLiveTranscript(replyText);
      fetchUserHistory(userKey);
      speakInVoiceMode(replyText, langCode);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputPrompt.trim() || loading || !user) return;

    const userText = inputPrompt.trim();
    setInputPrompt("");
    const updatedMessages = [...messages, { sender: "user" as const, message: userText }];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const userKey = user.phone || user.email;
      
      const res = await fetch("http://127.0.0.1:8000/api/chat/save-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userKey,
          sessionId: currentSessionId,
          type: "chat",
          messages: updatedMessages
        }),
      });
      const data = await res.json();
      const replyText = data.reply || data.response || data.message || data.output || "Bhai, backend se proper reply text nahi mila!";
      
      const finalMessages = [...updatedMessages, { sender: "ai" as const, message: replyText }];
      setMessages(finalMessages);
      fetchUserHistory(userKey);
    } catch (err) {
      console.error(err);
      const errorMessages = [...updatedMessages, { sender: "ai" as const, message: "Network error: Backend server connect nahi ho pa raha hai." }];
      setMessages(errorMessages);
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setCurrentSessionId("chat_" + Date.now());
    setIsSidebarOpen(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("jma_theme", newTheme);
  };

  const handleLogout = () => {
    localStorage.removeItem("jma_user");
    router.push("/login");
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!user) return <div className="min-h-screen bg-[#131314] text-white flex items-center justify-center">Loading...</div>;

  const isDark = theme === "dark";

  return (
    <div className={`flex h-screen w-screen overflow-hidden transition-colors duration-300 ${fontFamily} ${isDark ? "bg-[#131314] text-gray-100" : "bg-gray-100 text-gray-900"} relative`}>
      
      {/* BACKGROUND GLOW ANIMATION */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse transition-all duration-1000" />
      </div>

      {/* ================= EXPANDABLE SIDEBAR PANEL ================= */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs" onClick={() => setIsSidebarOpen(false)} />
      )}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 ${isDark ? "bg-[#1e1f20] border-gray-800" : "bg-white border-gray-200"} border-r p-4 flex flex-col justify-between transition-transform duration-300 shadow-2xl ${isSidebarOpen ? "translate-x-0 pointer-events-auto" : "-translate-x-full pointer-events-none"}`}>
        <div>
          <div className="flex items-center justify-between mb-4">
            <button onClick={startNewChat}
              className={`py-2.5 px-4 rounded-full font-medium text-xs flex items-center gap-2 transition cursor-pointer w-full justify-center ${isDark ? "bg-[#282a2c] hover:bg-[#333538] text-gray-200" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
            >
              <Plus size={16} /> New Chat Session
            </button>
            <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400 hover:text-white p-1.5 ml-2 rounded-full cursor-pointer"><X size={18} /></button>
          </div>

          <div className="flex bg-black/20 p-1 rounded-xl mb-3">
            <button 
              onClick={() => setActiveTab("chat")} 
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${activeTab === "chat" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`}
            >
              Chats
            </button>
            <button 
              onClick={() => setActiveTab("voice")} 
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${activeTab === "voice" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`}
            >
              Voice Logs
            </button>
          </div>

          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
            {activeTab === "chat" ? "Professional Chat History" : "Voice Assistant Sessions"}
          </div>

          <div className="space-y-1 overflow-y-auto max-h-[55vh] pr-1">
            {(activeTab === "chat" ? chatHistoryList : voiceHistoryList).map((session, idx) => (
              <div key={idx} className={`flex items-center gap-2 text-xs p-2.5 rounded-xl cursor-pointer truncate transition ${isDark ? "hover:bg-[#282a2c] text-gray-300" : "hover:bg-gray-200 text-gray-700"}`}
                onClick={() => {
                  if (session.messages) setMessages(session.messages);
                  if (session.sessionId) setCurrentSessionId(session.sessionId);
                  setIsSidebarOpen(false);
                  setTimeout(() => inputRef.current?.focus(), 100);
                }}
              >
                <MessageSquare size={14} className="text-blue-400 shrink-0" />
                <span className="truncate font-medium">{session.title || "Untitled Session"}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold text-xs">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-semibold truncate">{user.name}</h4>
              <p className="text-[10px] text-gray-400 truncate">Class {user.class}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 p-1.5 transition cursor-pointer"><LogOut size={16} /></button>
        </div>
      </aside>

      {/* MAIN INTERFACE */}
      <main className="flex-1 flex flex-col h-full w-full overflow-hidden relative z-10">
        
        {/* TOP BAR */}
        <header className="flex items-center justify-between px-4 py-3 shrink-0 z-30">
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={() => setIsSidebarOpen(prev => !prev)}
              className="p-2 rounded-full hover:bg-white/10 transition text-gray-300 cursor-pointer"
              title="Toggle Menu"
            >
              <Menu size={20} />
            </button>
            <span className="font-bold text-sm tracking-wide bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">JMA.AI</span>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-white/5 text-gray-300 transition cursor-pointer">
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={() => setIsSettingsOpen(true)} className="p-2 rounded-full hover:bg-white/5 text-gray-300 transition cursor-pointer">
              <Settings size={18} />
            </button>
          </div>
        </header>

        {/* VOICE PLAYGROUND OVERLAY */}
        {isVoiceMode ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 relative bg-black/90 backdrop-blur-2xl z-30">
            <button onClick={stopVoiceMode} className="absolute top-6 right-6 bg-red-600/20 hover:bg-red-600 border border-red-500/40 text-red-300 hover:text-white px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition cursor-pointer">
              <PhoneOff size={16} /> Exit Voice Mode
            </button>

            <div className="relative flex items-center justify-center mb-8">
              <div className="absolute rounded-full bg-blue-500/25 animate-ping" style={{ width: `${140 + audioLevel * 1.5}px`, height: `${140 + audioLevel * 1.5}px` }} />
              <div className="relative w-36 h-36 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-2xl shadow-blue-500/60 border-4 border-blue-400/50"
                style={{ transform: `scale(${1 + audioLevel / 160})` }}
              >
                <Sparkles size={44} className="animate-pulse" />
              </div>
            </div>

            <div className="max-w-xl text-center space-y-3">
              <p className="text-xs uppercase tracking-widest text-blue-400 font-bold">Sylvia AI Live Voice Assistant</p>
              <h2 className="text-sm md:text-base font-medium text-gray-200 px-6 py-3 rounded-2xl bg-white/5 border border-white/10">
                "{liveTranscript}"
              </h2>
            </div>
          </div>
        ) : messages.length === 0 ? (
          /* LANDING STATE */
          <div className="flex-1 flex flex-col items-center justify-center px-4 -mt-16">
            <div className="text-center space-y-6 max-w-2xl w-full">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight text-gray-100">
                What's the vibe, {user.name.split(" ")[0]}?
              </h1>

              <div className={`border ${isDark ? "bg-[#1e1f20]/90 border-gray-800" : "bg-white border-gray-300"} rounded-3xl p-3 flex flex-col gap-2 shadow-2xl backdrop-blur-md`}>
                <div className="flex items-center gap-2 px-1">
                  <button type="button" onClick={startNewChat} className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition cursor-pointer" title="New Chat">
                    <Plus size={18} />
                  </button>
                  <input 
                    ref={inputRef} 
                    type="text" 
                    value={inputPrompt} 
                    onChange={(e) => setInputPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={`Ask Sylvia AI, ${user.name.split(" ")[0]}...`}
                    className="w-full bg-transparent border-none text-xs md:text-sm text-white placeholder-gray-500 focus:outline-none px-2"
                  />
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-gray-800/60 px-1">
                  <div className="relative">
                    <button type="button" onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)} className="flex items-center gap-1 text-[11px] font-medium text-gray-400 bg-[#282a2c] hover:bg-[#333538] px-3 py-1.5 rounded-full transition cursor-pointer">
                      {selectedModel} <ChevronDown size={12} />
                    </button>
                    {isModelDropdownOpen && (
                      <div className="absolute left-0 bottom-full mb-2 w-36 bg-[#282a2c] border border-gray-700 rounded-xl shadow-2xl py-1 z-20">
                        {["Flash-Lite", "Flash 1.5", "Pro 1.5"].map(m => (
                          <button key={m} type="button" onClick={() => { setSelectedModel(m); setIsModelDropdownOpen(false); }} className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-[#3a3d40] cursor-pointer">
                            {m}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      type="button" 
                      onClick={startVoiceMode}
                      className="flex items-center gap-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 px-3 py-1.5 rounded-full text-xs font-medium transition cursor-pointer"
                    >
                      <Activity size={15} className="animate-pulse" />
                      <span className="hidden sm:inline">Voice Mode</span>
                    </button>

                    <button 
                      type="button"
                      onClick={() => handleSendMessage()}
                      disabled={loading || !inputPrompt.trim()} 
                      className="bg-white hover:bg-gray-200 disabled:bg-gray-700 text-black p-2 rounded-full transition cursor-pointer shadow-md"
                    >
                      <Send size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* CHAT CONVERSATION VIEW */
          <div className="flex-1 w-full overflow-hidden flex flex-col justify-between">
            <div className="flex-1 w-full overflow-y-auto px-4 flex flex-col items-center">
              <div className="max-w-3xl w-full space-y-6 py-6 my-auto">
                {messages.map((msg, index) => (
                  <div key={index} className={`flex gap-4 items-start ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.sender === "ai" && (
                      <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 mt-1">
                        <Bot size={16} />
                      </div>
                    )}
                    <div className={`flex flex-col gap-2 max-w-[85%] ${msg.sender === "user" ? "bg-[#282a2c] text-gray-100 p-4 rounded-2xl rounded-tr-none shadow-md" : "text-gray-200 w-full"}`}>
                      <div className="whitespace-pre-wrap text-xs md:text-sm leading-relaxed">
                        {msg.message}
                      </div>

                      {/* CHATGPT STYLE ACTION BUTTONS FOR AI MESSAGES */}
                      {msg.sender === "ai" && (
                        <div className="flex items-center gap-2 pt-2 text-gray-400">
                          <button 
                            onClick={() => copyToClipboard(msg.message, index)}
                            className="p-1.5 hover:bg-white/10 rounded-lg transition flex items-center gap-1 text-[11px] cursor-pointer"
                            title="Copy"
                          >
                            {copiedIndex === index ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                            {copiedIndex === index && <span className="text-green-400">Copied</span>}
                          </button>
                          <button className="p-1.5 hover:bg-white/10 rounded-lg transition cursor-pointer" title="Good response">
                            <ThumbsUp size={14} />
                          </button>
                          <button className="p-1.5 hover:bg-white/10 rounded-lg transition cursor-pointer" title="Bad response">
                            <ThumbsDown size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-4 items-start justify-start">
                    <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                      <Bot size={16} />
                    </div>
                    <div className="p-4 rounded-2xl text-xs text-gray-400 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" /> Sylvia AI is preparing detailed study notes...
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* FIXED BOTTOM INPUT BAR */}
            <div className="w-full max-w-3xl mx-auto p-4 shrink-0 bg-transparent">
              <form onSubmit={handleSendMessage} className={`border ${isDark ? "bg-[#1e1f20] border-gray-800" : "bg-white border-gray-300"} rounded-3xl p-3 flex flex-col gap-2 shadow-xl`}>
                <div className="flex items-center gap-2 px-1">
                  <button type="button" onClick={startNewChat} className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition cursor-pointer" title="New Chat">
                    <Plus size={18} />
                  </button>
                  <input 
                    ref={inputRef}
                    type="text" 
                    value={inputPrompt} 
                    onChange={(e) => setInputPrompt(e.target.value)}
                    placeholder={`Ask Sylvia AI, ${user.name.split(" ")[0]}...`}
                    className="w-full bg-transparent border-none text-xs md:text-sm text-white placeholder-gray-500 focus:outline-none px-2"
                  />
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-gray-800/60 px-1">
                  <div className="relative">
                    <button type="button" onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)} className="flex items-center gap-1 text-[11px] font-medium text-gray-400 bg-[#282a2c] hover:bg-[#333538] px-3 py-1.5 rounded-full transition cursor-pointer">
                      {selectedModel} <ChevronDown size={12} />
                    </button>
                    {isModelDropdownOpen && (
                      <div className="absolute left-0 bottom-full mb-2 w-36 bg-[#282a2c] border border-gray-700 rounded-xl shadow-2xl py-1 z-20">
                        {["Flash-Lite", "Flash 1.5", "Pro 1.5"].map(m => (
                          <button key={m} type="button" onClick={() => { setSelectedModel(m); setIsModelDropdownOpen(false); }} className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-[#3a3d40] cursor-pointer">
                            {m}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      type="button" 
                      onClick={startVoiceMode}
                      className="flex items-center gap-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 px-3 py-1.5 rounded-full text-xs font-medium transition cursor-pointer"
                    >
                      <Activity size={15} className="animate-pulse" />
                      <span className="hidden sm:inline">Voice Mode</span>
                    </button>

                    <button 
                      type="submit" 
                      disabled={loading || !inputPrompt.trim()} 
                      className="bg-white hover:bg-gray-200 disabled:bg-gray-700 text-black p-2 rounded-full transition cursor-pointer shadow-md"
                    >
                      <Send size={15} />
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* SETTINGS MODAL */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-3xl p-6 border shadow-2xl ${isDark ? "bg-[#13141c] border-gray-800 text-white" : "bg-white border-gray-200 text-gray-900"}`}>
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-800/50">
              <h3 className="font-bold text-base flex items-center gap-2"><Settings size={18} className="text-blue-500" /> Interface Settings</h3>
              <button onClick={() => setIsSettingsOpen(false)} className="text-gray-400 hover:text-white p-1 rounded-lg cursor-pointer"><X size={18} /></button>
            </div>
            <div className="mb-6">
              <label className="text-xs font-semibold text-gray-400 block mb-2">Select Font Style</label>
              <div className="grid grid-cols-2 gap-2">
                {[{ name: "Sans Serif", class: "font-sans" }, { name: "Serif", class: "font-serif" }, { name: "Monospace", class: "font-mono" }].map(f => (
                  <button key={f.class} onClick={() => { setFontFamily(f.class); localStorage.setItem("jma_font", f.class); }}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium transition cursor-pointer ${fontFamily === f.class ? "bg-blue-600 text-white border-blue-500" : isDark ? "bg-[#181a22] border-gray-800 text-gray-300" : "bg-gray-100 border-gray-300 text-gray-700"}`}
                  >{f.name}</button>
                ))}
              </div>
            </div>
            <button onClick={() => setIsSettingsOpen(false)} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer">Done & Save</button>
          </div>
        </div>
      )}
    </div>
  );
}