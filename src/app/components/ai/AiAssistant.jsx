'use client';
import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, ExternalLink, Sparkles } from 'lucide-react';
import Link from 'next/link';

const QUICK_REPLIES = [
  { label: 'Electrician', text: 'Mujhe electrician chahiye' },
  { label: 'Plumber', text: 'Mujhe plumber chahiye' },
  { label: 'AC Repair', text: 'AC repair service chahiye' },
  { label: 'Painter', text: 'Painter chahiye ghar ke liye' },
  { label: 'Cleaner', text: 'House cleaning service chahiye' },
  { label: 'Carpenter', text: 'Carpenter chahiye furniture ke liye' },
];

const INITIAL_MESSAGE = {
  role: 'assistant',
  content: 'Assalam o Alaikum! 👋 Main Service Markaz ka AI Assistant hoon. Main aapko ap ky shehar mein koi bhi service provider dhondhne mein help kar sakta hoon, jesa kih electrician, plumber, AC repair, aur bahut kuch! Aap kya service chahte hain?',
  action: null,
};

export default function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const showQuickReplies = messages.length === 1; // Show only before first user message

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (text) => {
    const msgText = text || input;
    if (!msgText.trim() || isLoading) return;

    const userMessage = { role: 'user', content: msgText, action: null };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      // History for Gemini: exclude welcome msg, error messages, format as user/model pairs
      const apiHistory = messages
        .filter((_, idx) => idx !== 0)
        .filter(msg => !msg.isError)
        .map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        }));

      // Full conversation text for city/category detection on backend
      const conversationText = updatedMessages
        .filter(m => m.role === 'user')
        .map(m => m.content)
        .join(' ');

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msgText, history: apiHistory, conversationText }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || `Server error ${response.status}`);
      }

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: data.text || 'Jawab nahi mila. Apna sawal dobara likhein.',
          action: data.action || null,
          isError: false,
        },
      ]);
    } catch (err) {
      console.error('AI chat error:', err?.message || err);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Maafi chahta hoon, abhi kuch masla aa gaya. Thodi dair mein dobara koshish karein.', action: null, isError: true },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSend(input);
  };

  const handleReset = () => {
    setMessages([INITIAL_MESSAGE]);
    setInput('');
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 p-4 bg-primary text-white rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 z-50 ${isOpen ? 'hidden' : 'flex'} items-center justify-center`}
        aria-label="Open AI Assistant"
      >
        <Sparkles size={24} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[380px] sm:h-[600px] sm:rounded-2xl sm:shadow-2xl sm:border sm:border-gray-200 overflow-hidden transform transition-all duration-300">

          {/* Header */}
          <div className="px-4 py-3 sm:py-4 bg-primary text-white flex justify-between items-center shrink-0 shadow-sm relative overflow-hidden">
            {/* Subtle background decoration */}
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
            
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shadow-inner">
                <Bot size={20} className="text-white" />
              </div>
              <div className="flex flex-col">
                <h3 className="font-bold text-sm sm:text-base leading-tight">Service Markaz AI</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse"></span>
                  <span className="text-[11px] sm:text-xs text-green-50 font-medium tracking-wide">Online • Powered by Gemini</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 relative z-10">
              <button
                onClick={handleReset}
                className="text-white/80 hover:text-white text-xs sm:text-sm font-medium transition-colors px-2.5 py-1.5 rounded-lg hover:bg-white/20"
                title="New chat"
              >
                Reset
              </button>
              <button onClick={() => setIsOpen(false)} className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors ml-1">
                <X size={22} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-slate-50 flex flex-col gap-4 sm:gap-3">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                <div className={`flex gap-2.5 max-w-[90%] sm:max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 sm:w-7 sm:h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 sm:mt-1 shadow-sm ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-green-100 text-primary'}`}
                  >
                    {msg.role === 'user' ? <User size={15} /> : <Bot size={15} />}
                  </div>

                  {/* Bubble */}
                  <div className="flex flex-col gap-2.5">
                    <div
                      className={`px-3.5 py-2.5 sm:px-3 sm:py-2.5 rounded-2xl text-[14.5px] sm:text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${msg.role === 'user'
                        ? 'bg-primary text-white rounded-tr-sm'
                        : 'bg-white border border-gray-100 rounded-tl-sm text-gray-800'
                      }`}
                    >
                      {msg.content}
                    </div>

                    {/* Action Button */}
                    {msg.action?.type === 'browse' && (
                      <Link
                        href={msg.action.url}
                        onClick={() => setIsOpen(false)}
                        className="group flex items-center gap-2 text-[14px] sm:text-sm font-semibold text-primary bg-primary/10 border border-primary/20 px-4 py-2.5 rounded-xl transition-all hover:bg-primary hover:text-white hover:shadow-md self-start"
                      >
                        <ExternalLink size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        {msg.action.label}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex justify-start animate-in fade-in duration-300">
                <div className="flex gap-2.5 max-w-[88%]">
                  <div className="w-8 h-8 sm:w-7 sm:h-7 rounded-full bg-green-100 text-primary shadow-sm flex items-center justify-center shrink-0 mt-0.5 sm:mt-1">
                    <Bot size={15} />
                  </div>
                  <div className="px-4 py-3.5 rounded-2xl bg-white border border-gray-100 shadow-sm rounded-tl-sm flex items-center gap-1.5 h-[42px]">
                    <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Reply Chips */}
            {showQuickReplies && !isLoading && (
              <div className="flex flex-wrap gap-2 mt-2">
                {QUICK_REPLIES.map((qr) => (
                  <button
                    key={qr.label}
                    onClick={() => handleSend(qr.text)}
                    className="text-[13px] sm:text-xs border border-primary/20 text-primary bg-white hover:bg-primary hover:text-white shadow-sm px-3.5 py-2 sm:px-3 sm:py-1.5 rounded-full transition-all font-medium whitespace-nowrap"
                  >
                    {qr.label}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} className="h-2" />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="p-3 sm:p-4 bg-white border-t border-gray-100 flex gap-2 sm:gap-3 shrink-0 pb-safe">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Service ya city likhein..."
              className="flex-1 bg-slate-100 hover:bg-slate-200/50 rounded-full px-5 py-3 sm:py-2.5 text-[15px] sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors border border-transparent focus:bg-white"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-3 sm:p-2 bg-primary text-white rounded-full disabled:opacity-50 disabled:hover:scale-100 transition-all hover:scale-105 hover:bg-primary-hover hover:shadow-md flex items-center justify-center w-12 h-12 sm:w-10 sm:h-10 shrink-0"
            >
              <Send size={18} className="ml-0.5 sm:ml-1" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

