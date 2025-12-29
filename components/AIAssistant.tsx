
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Sparkles } from 'lucide-react';
import { analyzeHostingData } from '../services/geminiService';
import { useData } from '../context/DataContext';

const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    { role: 'assistant', text: 'Hello! I can help you analyze hosting data, draft renewal emails, or find overdue invoices. How can I help?' }
  ]);
  const [loading, setLoading] = useState(false);
  const { records } = useData();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    const response = await analyzeHostingData(userMsg, records);

    setMessages(prev => [...prev, { role: 'assistant', text: response }]);
    setLoading(false);
  };

  return (
    <div className="no-print AIAssistant-container">
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-lg transition-all duration-300 z-50 flex items-center gap-2 ${
          isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100 bg-indigo-600 hover:bg-indigo-700 text-white'
        }`}
      >
        <Sparkles size={24} />
        <span className="font-medium hidden md:inline">Ask AI</span>
      </button>

      {/* Chat Interface */}
      <div
        className={`fixed bottom-6 right-6 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col transition-all duration-300 z-50 overflow-hidden ${
          isOpen 
            ? 'opacity-100 translate-y-0 h-[600px]' 
            : 'opacity-0 translate-y-10 h-0 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <Bot size={20} />
            <h3 className="font-semibold">HostMaster Assistant</h3>
          </div>
          <button onClick={() => setIsOpen(false)} className="hover:bg-indigo-500 p-1 rounded-full">
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white ml-auto rounded-br-none'
                  : 'bg-white border border-gray-200 text-gray-700 mr-auto rounded-bl-none shadow-sm'
              }`}
            >
              <div className="markdown-body" style={{whiteSpace: 'pre-wrap'}}>
                 {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-bl-none w-16 shadow-sm">
              <div className="flex space-x-1 justify-center">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-gray-100">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about renewals, revenue..."
              className="flex-1 bg-gray-100 border-0 rounded-full px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="bg-indigo-600 text-white p-2.5 rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
          <p className="text-[10px] text-center text-gray-400 mt-2">
            Powered by Google Gemini. AI can make mistakes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
