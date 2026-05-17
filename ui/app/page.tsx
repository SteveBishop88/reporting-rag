'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChatStore } from './store';
import { Send, Bot, User, Terminal, Sparkles, Trash2 } from 'lucide-react';

export default function Home() {
  const [input, setInput] = useState('');
  // Pulled in the clearChat action directly from our global store
  const { messages, isLoading, addMessage, setIsLoading, clearChat } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scrolls the chat window down to the latest message as they stream in
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userQuestion = input.trim();
    setInput(''); // Clear input instantly for snappy user feedback

    // 1. Commit the user's message to the Zustand global store
    addMessage({
      role: 'user',
      content: userQuestion,
    });

    // 2. Turn on the shimmering loading state
    setIsLoading(true);

    try {
      // 3. Fire the asynchronous network request across ports to FastAPI
      const response = await fetch('http://127.0.0.1:8000/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: userQuestion }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }

      const data = await response.json();

      // 4. Commit the AI's generated response and sources to the store
      addMessage({
        role: 'assistant',
        content: data.answer,
        sources: data.sources,
      });

    } catch (error) {
      console.error('Failed to query local RAG backend:', error);
      addMessage({
        role: 'assistant',
        content: '⚠️ Error: Failed to connect to local intelligence server. Ensure your FastAPI app is running.',
      });
    } finally {
      // 5. Always turn off the loading animation when processing wraps up
      setIsLoading(false);
    }
  };

  return (
    <main className="flex h-screen bg-slate-50 text-slate-900 antialiased selection:bg-indigo-500/20">
      
      {/* Side Brand Panel (Light Slate Theme) */}
      <div className="hidden md:flex w-72 flex-col justify-between border-r border-slate-200 bg-slate-100 p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md shadow-indigo-500/10">
              <Terminal className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-sm leading-none tracking-tight text-slate-800">RAG Dashboard</h1>
              <span className="text-xs text-slate-500 font-medium">Local Engine</span>
            </div>
          </div>
          
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-indigo-500" /> Active Hardware
            </p>
            <p className="text-xs text-slate-600 font-medium">LLM: <span className="text-slate-900 font-semibold">llama3.1</span></p>
            <p className="text-xs text-slate-600 font-medium">DB: <span className="text-slate-900 font-semibold">ChromaDB Store</span></p>
          </div>
        </div>
        
        <div className="text-xs text-slate-400 font-medium">
          Resume Document Intelligence v1.0
        </div>
      </div>

      {/* Main Container Layer */}
      <div className="flex flex-1 flex-col bg-white">
        
        {/* Top Header Bar with Dynamic Clear Utility */}
        <div className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-8 shadow-sm">
          <div className="text-sm font-semibold text-slate-700 md:hidden flex items-center gap-2">
            <Terminal className="h-4 w-4 text-indigo-600" /> Resume Intelligence
          </div>
          <div className="hidden md:block text-xs font-medium text-slate-400">
            Session Status: <span className="text-emerald-600 font-semibold">Online</span>
          </div>

          {/* Clear Session Trigger Button */}
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-600 shadow-sm transition-all hover:bg-rose-50 hover:border-rose-200 active:scale-95"
              title="Clear entire chat history"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear Conversation
            </button>
          )}
        </div>
        
        {/* Messages Scrolling Grid */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 px-4 py-8 md:px-8">
          <div className="mx-auto max-w-3xl space-y-6">
            
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
                  <Bot className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="space-y-1.5">
                  <h2 className="text-base font-semibold tracking-tight text-slate-800">Local Candidate Analysis Engine</h2>
                  <p className="text-sm text-slate-500 max-w-sm">Ask detailed technical questions regarding the resume parsing database.</p>
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg border border-slate-200 bg-white text-indigo-600 shadow-sm">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                
                <div className={`flex flex-col max-w-[85%] space-y-2 rounded-2xl px-4 py-3 text-sm shadow-sm font-normal leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  
                  {/* Sources Display (High legibility dark font) */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                      <span className="font-semibold block text-slate-500 uppercase tracking-wider text-[10px] mb-1">Retrieved Sources:</span>
                      <ul className="list-disc pl-4 space-y-0.5">
                        {msg.sources.map((src, idx) => (
                          <li key={idx} className="italic text-slate-600">{src}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 shadow-sm">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}

            {/* Light Mode Shimmering Skeleton Loader */}
            {isLoading && (
              <div className="flex gap-4 justify-start">
                <div className="flex h-8 w-8 animate-pulse items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-300">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex flex-col space-y-2 rounded-2xl rounded-bl-none border border-slate-200 bg-white px-4 py-3 w-3/4 shadow-sm">
                  <div className="h-3 w-1/3 animate-pulse rounded-md bg-slate-100" />
                  <div className="h-3 w-5/6 animate-pulse rounded-md bg-slate-100" />
                  <div className="h-3 w-2/3 animate-pulse rounded-md bg-slate-100" />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Bottom Sticky Input Form (Crisp White Shield) */}
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:px-8">
          <form onSubmit={handleSubmit} className="mx-auto max-w-3xl flex items-center gap-3 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => e.target.value.length <= 500 && setInput(e.target.value)}
              placeholder="Ask a question about the candidate's portfolio..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-12 text-sm text-slate-900 placeholder-slate-400 shadow-inner focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all duration-200"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md transition-all duration-200 hover:bg-indigo-500 active:scale-95 disabled:pointer-events-none disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

      </div>
    </main>
  );
}