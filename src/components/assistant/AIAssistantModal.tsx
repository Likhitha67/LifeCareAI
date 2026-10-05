import React, { useState, useEffect } from 'react';
import { Sparkles, Send, Bot, User, ShieldAlert, BookOpen } from 'lucide-react';
import { Modal } from '../common/Modal';
import { askLifeCareAssistant } from '../../services/aiService';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialContextText?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  initialContextText,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialContextText) {
        setMessages([
          {
            id: 'msg_init',
            sender: 'assistant',
            text: `Hello! I have loaded your document context. Would you like me to summarize the key points, explain any unfamiliar medical terms, or verify expiry information?`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else if (messages.length === 0) {
        setMessages([
          {
            id: 'msg_welcome',
            sender: 'assistant',
            text: `Hello! I'm your LifeCare AI Assistant. I can help you understand health terminology, summarize non-sensitive documents, and explain medicine schedules.\n\n*Note: I cannot diagnose conditions, prescribe medicines, or provide emergency care.*`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    }
  }, [isOpen, initialContextText]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');

    const newMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setLoading(true);

    try {
      const response = await askLifeCareAssistant(userText, initialContextText);
      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        sender: 'assistant',
        text: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot_${Date.now()}`,
          sender: 'assistant',
          text: 'I encountered an error answering your question. Please verify your query and consult a physician if you have clinical questions.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sampleQuestions = [
    'Explain Paracetamol 500 mg usage',
    'What does Vitamin D3 do?',
    'How are passport expiry alerts handled?',
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="LifeCare AI Assistant"
      subtitle="Plain-language explanations for medical terms and documents"
      maxWidth="2xl"
    >
      <div className="flex flex-col h-[520px]">
        {/* Safety Disclaimer Banner */}
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl p-3 flex items-start gap-2.5 text-[11px] text-amber-900 dark:text-amber-200 mb-3 flex-shrink-0">
          <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p>
            <strong>Medical Notice:</strong> This assistant explains terminology for informational organization only. It does not provide medical diagnoses or replace licensed physician consultations.
          </p>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
          {messages.map((m) => {
            const isBot = m.sender === 'assistant';
            return (
              <div
                key={m.id}
                className={`flex items-start gap-2.5 ${isBot ? '' : 'flex-row-reverse'}`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                    isBot
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-blue-600 text-white shadow-2xs'
                  }`}
                >
                  {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed ${
                    isBot
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  {m.text}
                  <span
                    className={`block text-[10px] mt-1 text-right ${
                      isBot ? 'text-slate-400' : 'text-blue-200'
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 w-fit text-xs text-slate-500">
              <div className="h-3 w-3 rounded-full bg-indigo-600 animate-ping" />
              <span>Analyzing terms with LifeCare AI...</span>
            </div>
          )}
        </div>

        {/* Suggested Queries */}
        <div className="py-2 flex flex-wrap gap-1.5 flex-shrink-0">
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInput(q);
              }}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSend} className="pt-2 border-t border-slate-100 dark:border-slate-800 flex gap-2 flex-shrink-0">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about a medical term or document summary..."
            className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-xs hover:shadow transition-all disabled:opacity-50 flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Ask</span>
          </button>
        </form>
      </div>
    </Modal>
  );
};
