import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, Loader2, Sparkles, HelpCircle } from 'lucide-react';
import axios from 'axios';

const QUICK_QUESTIONS = [
  "What does waiting period mean for me?",
  "What's not covered by this policy?",
  "How does co-pay work?"
];

export default function ChatInterface({ session_id, profile }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle first load welcome message
  useEffect(() => {
    if (session_id && messages.length === 0) {
      sendWelcomeMessage();
    }
  }, [session_id]);

  const sendWelcomeMessage = async () => {
    setLoading(true);
    const welcomeMsg = `Introduce yourself briefly and tell me the one most important thing ${profile.fullName} should know about their recommended policy given their ${profile.conditions?.join(', ') || 'health background'}.`;
    
    try {
      const response = await axios.post('/api/chat', {
        session_id,
        message: welcomeMsg
      });
      
      setMessages([{
        role: 'ai',
        content: response.data.response
      }]);
    } catch (err) {
      console.error("Failed to fetch welcome message", err);
      setMessages([{
        role: 'ai',
        content: "Hi! I'm Aarogya, your health insurance assistant. How can I help you understand your policy today?"
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (text) => {
    const messageText = text || input;
    if (!messageText.trim() || loading) return;

    const userMessage = { role: 'user', content: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post('/api/chat', {
        session_id,
        message: messageText
      });

      setMessages(prev => [...prev, {
        role: 'ai',
        content: response.data.response
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'ai',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment."
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-gray-900 rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-800">
      {/* Header */}
      <div className="bg-gray-800/50 px-8 py-6 border-b border-gray-700/50 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="p-3 bg-teal-500/20 rounded-2xl">
              <Bot className="text-teal-400" size={24} />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-gray-900 rounded-full"></div>
          </div>
          <div>
            <h3 className="text-white font-black tracking-tight">Aarogya AI</h3>
            <div className="text-[10px] font-black text-teal-400 uppercase tracking-widest">Always Active</div>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-gray-500 font-bold text-xs uppercase tracking-widest">
            <Sparkles size={14} className="text-teal-500" />
            <span>AI powered Expert</span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-grow overflow-y-auto p-6 md:p-8 space-y-6 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[85%] flex items-start space-x-3 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
              <div className={`flex-shrink-0 p-2 rounded-xl ${msg.role === 'user' ? 'bg-gray-700 text-gray-400' : 'bg-teal-500/20 text-teal-400'}`}>
                {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
              </div>
              <div className={`p-4 md:p-5 rounded-2xl text-sm md:text-base font-medium leading-relaxed shadow-lg ${
                msg.role === 'user' 
                  ? 'bg-gray-800 text-gray-200 rounded-tr-none' 
                  : 'bg-teal-600 text-white rounded-tl-none shadow-teal-900/20'
              }`}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start animate-in fade-in duration-300">
            <div className="bg-teal-500/20 p-4 rounded-2xl rounded-tl-none flex items-center space-x-2">
              <Loader2 className="animate-spin text-teal-400" size={18} />
              <span className="text-teal-400 text-xs font-black uppercase tracking-widest">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 md:p-8 bg-gray-800/30 border-t border-gray-700/50 space-y-4">
        {/* Quick Questions */}
        <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 scrollbar-none">
          {QUICK_QUESTIONS.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSend(q)}
              className="whitespace-nowrap px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold rounded-full border border-gray-700 transition-all flex items-center space-x-2 shadow-sm active:scale-95"
            >
              <HelpCircle size={14} className="text-teal-500" />
              <span>{q}</span>
            </button>
          ))}
        </div>

        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about this policy..."
            className="w-full bg-gray-800 border-2 border-transparent focus:border-teal-500/50 text-white rounded-2xl px-6 py-4 pr-16 outline-none transition-all placeholder:text-gray-500 font-medium"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 p-3 bg-teal-600 hover:bg-teal-50 text-white hover:text-teal-600 rounded-xl transition-all disabled:opacity-20 disabled:cursor-not-allowed active:scale-90"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
