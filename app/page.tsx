"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [currentChat, setCurrentChat] = useState<any[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [question, setQuestion] = useState("");
  const [isAnswering, setIsAnswering] = useState(false);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem("waju_sessions");
    if (saved) {
      const parsed = JSON.parse(saved);
      setSessions(parsed);
      if (parsed.length > 0) {
        setActiveSessionId(parsed[0].id);
        setCurrentChat(parsed[0].messages);
      }
    }
  }, []);

  const saveToStorage = (updatedSessions: any[]) => {
    setSessions(updatedSessions);
    localStorage.setItem("waju_sessions", JSON.stringify(updatedSessions));
  };

  const startNewChat = () => {
    const newId = Date.now();
    setActiveSessionId(newId);
    setCurrentChat([]);
  };

  const deleteHistoryItem = (id: number, e: React.MouseEvent) => {
    e.stopPropagation(); 
    const filtered = sessions.filter(s => s.id !== id);
    saveToStorage(filtered);
    if (activeSessionId === id) {
      setCurrentChat([]);
      setActiveSessionId(null);
    }
  };

  const askQuestion = async () => {
    if (!question.trim()) return;
    setIsAnswering(true);
    const userMsg = { role: 'user', content: question };
    const history = [...currentChat, userMsg];
    setCurrentChat(history);
    setQuestion("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ question: userMsg.content, history: history }),
      });
      const data = await res.json();
      const updatedHistory = [...history, { role: 'assistant', content: data.answer || data.error }];
      setCurrentChat(updatedHistory);

      let updatedSessions;
      const exists = sessions.find(s => s.id === activeSessionId);
      if (exists) {
        updatedSessions = sessions.map(s => 
          s.id === activeSessionId ? { ...s, messages: updatedHistory } : s
        );
      } else {
        const newSession = { 
          id: activeSessionId || Date.now(), 
          messages: updatedHistory, 
          title: userMsg.content.slice(0, 25) 
        };
        updatedSessions = [newSession, ...sessions];
        setActiveSessionId(newSession.id);
      }
      saveToStorage(updatedSessions);
    } catch (err) {
      console.error(err);
    }
    setIsAnswering(false);
  };

  return (
    <div className="flex h-screen bg-[#020617] text-slate-100 font-sans overflow-hidden">
      {/* SIDEBAR: HISTORY COLUMN */}
      <aside className="w-72 bg-[#0f172a] border-r border-slate-800 flex flex-col p-4 hidden md:flex">
        <button onClick={startNewChat} className="w-full bg-blue-600 hover:bg-blue-500 p-3 rounded-xl mb-6 transition-all font-bold text-sm shadow-lg shadow-blue-500/20">
          + New Chat
        </button>
        
        <div className="flex-1 overflow-y-auto space-y-2">
          <p className="text-[10px] text-slate-500 font-black uppercase mb-4 tracking-widest">Chat History</p>
          {sessions.map((s) => (
            <div key={s.id} onClick={() => { setActiveSessionId(s.id); setCurrentChat(s.messages); }}
              className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${activeSessionId === s.id ? 'bg-slate-800 border border-slate-700' : 'hover:bg-slate-800/50'}`}>
              <span className="text-xs truncate text-slate-300 w-4/5">{s.title || "Untitled Chat"}</span>
              <button onClick={(e) => deleteHistoryItem(s.id, e)} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-500 transition-all text-lg">
                ×
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* MAIN CHAT AREA */}
      <main className="flex-1 flex flex-col relative">
        <header className="p-4 border-b border-slate-800 flex justify-between items-center bg-[#020617]/50 backdrop-blur-md">
          <h1 className="text-xl font-black text-blue-500 tracking-tighter uppercase">Waju AI</h1>
          <div className="text-right">
            <p className="text-[10px] font-black text-blue-400 tracking-widest uppercase">Built by Waju Studio</p>
            <p className="text-[11px] font-bold text-white tracking-tight">📞 +2348143160357</p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-32">
          {currentChat.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-blue-600/10 rounded-full flex items-center justify-center mb-4 border border-blue-500/20">
                <span className="text-3xl font-black text-blue-500">W</span>
              </div>
              <h2 className="text-2xl font-black text-slate-400 uppercase">Ask Anything.</h2>
              <p className="text-slate-600 text-sm mt-2 max-w-xs px-4 italic">
                Get high-end web solutions from Waju Studio.
              </p>
            </div>
          )}
          {currentChat.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xl p-5 rounded-3xl ${msg.role === 'user' ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/20' : 'bg-slate-800/60 border border-slate-700 text-slate-200'}`}>
                <p className="text-[9px] font-black opacity-50 mb-2 uppercase tracking-widest">{msg.role === 'user' ? 'You' : 'Professor Waju'}</p>
                <div className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          ))}
          {isAnswering && <div className="text-blue-500 animate-pulse text-xs font-black tracking-widest">WAJU IS PROCESSING...</div>}
        </div>

        <div className="p-6 bg-gradient-to-t from-[#020617] via-[#020617] to-transparent">
          <div className="max-w-2xl mx-auto bg-[#1e293b] p-2 rounded-2xl flex border border-slate-700 shadow-2xl focus-within:border-blue-500/50 transition-all">
            <input 
              className="bg-transparent flex-1 p-3 outline-none text-sm text-white" 
              placeholder="Ask anything..." 
              value={question} 
              onChange={(e) => setQuestion(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && askQuestion()} 
            />
            <button onClick={askQuestion} className="bg-blue-600 px-8 py-3 rounded-xl font-black text-xs uppercase hover:bg-blue-500 transition-all">Ask</button>
          </div>
        </div>
      </main>
    </div>
  );
}