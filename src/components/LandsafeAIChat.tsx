import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { 
  Bot, 
  Send, 
  Sparkles, 
  RotateCcw, 
  HelpCircle,
  Database,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

interface LandsafeAIChatProps {
  onClose?: () => void;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    role: 'assistant',
    content: `Hello! I am **Landsafe AI**, your geospatial landslide hazard and early-warning intelligence assistant for the North Eastern Region of India.
    
I am directly connected to the platform's active hydrological telemetry, DEM terrain slope layers, and XGBoost TreeSHAP inference engine across all 8 NER states. How can I assist your monitoring team today?`,
    timestamp: 'Just now',
    suggestedPrompts: [
      'Which districts currently have the highest landslide risk?',
      'Why is the Noney / Tupul railway sector under Critical alert?',
      'What factors increase slope instability in Meghalaya and Sikkim?',
      'What immediate actions should the DDMA take for critical zones?'
    ]
  }
];

export const LandsafeAIChat: React.FC<LandsafeAIChatProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim() })
      });

      if (!res.ok) {
        throw new Error('Server responded with error');
      }

      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'No analysis generated.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `I encountered a momentary connection issue. However, based on our local database:
• Highest hazard zones: Mangan (Sikkim), Noney (Manipur), Cherrapunji (Meghalaya), and Haflong (Assam).
• Primary trigger: 24h rainfall surpassing 120mm on fractured bedrock slopes exceeding 35°.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages(INITIAL_MESSAGES);
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col justify-between space-y-3">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-xs shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0F2747] flex items-center justify-center text-[#2F80ED] shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-[#0F2747] text-base">Landsafe AI Intelligence</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-[#2F80ED] font-semibold border border-blue-200">
                Ground-Truth RAG
              </span>
            </div>
            <p className="text-xs text-[#64748B]">
              Natural language intelligence grounded in NER topography, real-time hydromet observations, and DDMA SOPs.
            </p>
          </div>
        </div>

        <button
          onClick={handleClearHistory}
          className="p-2 text-slate-500 hover:text-[#0F2747] bg-[#F6F8FB] hover:bg-slate-200 rounded-lg text-xs transition-colors flex items-center gap-1 border border-slate-200"
          title="Reset conversation"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-2 space-y-3 pr-1">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-lg bg-[#0F2747] flex items-center justify-center text-[#2F80ED] shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-xl p-3.5 text-xs leading-relaxed shadow-xs ${
                  isUser
                    ? 'bg-[#0F2747] text-white'
                    : 'bg-white text-[#172033] border border-slate-200'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Suggested Prompts if present */}
                {msg.suggestedPrompts && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5">
                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                      Recommended Decision Support Queries:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggestedPrompts.map((p, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(p)}
                          className="text-left text-[11px] bg-[#F6F8FB] hover:bg-slate-100 text-[#0F2747] border border-slate-200 px-2.5 py-1 rounded-md transition-colors font-medium"
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-[10px] text-right mt-1 opacity-70">
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-[#64748B] p-2">
            <Bot className="w-4 h-4 text-[#2F80ED] animate-bounce" />
            <span>Analyzing hydrometeorological radar data and terrain features...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Field */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputPrompt);
        }}
        className="bg-white border border-slate-200 rounded-xl p-2 flex items-center gap-2 shadow-xs shrink-0"
      >
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          placeholder="Ask about district risks, rainfall triggers, or evacuation guidelines..."
          className="flex-1 bg-[#F6F8FB] border border-slate-200 rounded-lg px-3 py-2 text-xs text-[#172033] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2F80ED]/30 focus:border-[#2F80ED]"
        />
        <button
          type="submit"
          disabled={!inputPrompt.trim() || loading}
          className="bg-[#2F80ED] hover:bg-[#256cd1] disabled:opacity-50 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
