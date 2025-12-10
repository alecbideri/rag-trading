import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { chatWithDeepSeek } from '../services/api';

export default function ChatInterface({ contextData }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '# Hello! \nI can analyze the market data for you. Ask me anything about the stocks on your dashboard.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Call DeepSeek API with context
    // We filter history to keep context window manageable if needed, 
    // but for now passing full history is fine for a demo.
    const response = await chatWithDeepSeek(
      [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
      contextData
    );

    setMessages(prev => [...prev, response]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 max-w-[90vw] h-[600px] max-h-[80vh] flex flex-col bg-[#0d1117] border border-green-500/20 shadow-2xl z-50 overflow-hidden rounded-lg font-sans">
      {/* Header */}
      <div className="p-4 bg-green-900/10 border-b border-green-500/20 flex items-center justify-between">
        <h2 className="text-green-400 font-bold tracking-wider">MARKET AI</h2>
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-green-900/50">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`
                max-w-[85%] p-3 text-sm rounded-lg
                ${msg.role === 'user'
                  ? 'bg-green-600/20 border border-green-500/30 text-green-50'
                  : 'bg-[#161b22] border border-gray-800 text-gray-300'
                }
              `}
            >
              <div className="prose prose-invert max-w-none prose-sm prose-p:my-1 prose-headings:text-green-400 prose-pre:bg-black/50 prose-pre:p-2">
                <ReactMarkdown>
                  {msg.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#161b22] border border-gray-800 p-3 text-green-400 text-sm animate-pulse">
              Analyzing market data...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4 bg-[#161b22] border-t border-green-500/20">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about trends..."
            className="w-full bg-[#0d1117] border border-green-900/50 p-3 pr-10 text-white focus:outline-none focus:border-green-500 focus:shadow-[0_0_10px_rgba(34,197,94,0.2)] placeholder-gray-600 transition-all"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500 hover:text-green-400 disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
