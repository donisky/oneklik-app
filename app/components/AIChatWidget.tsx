'use client';

import { useAIChat } from '../hooks/useAIChat';

export default function AIChatWidget() {
  const { 
    isOpen, setIsOpen, 
    messages, input, setInput, 
    isLoading, sendMessage 
  } = useAIChat();

  const handleSend = () => {
    sendMessage(input);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 flex items-center gap-2"
        >
          <span className="text-2xl">💬</span>
          <span className="hidden sm:inline text-sm font-medium">AI Assistant</span>
        </button>
      )}

      {isOpen && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl flex flex-col w-[350px] md:w-[400px] max-h-[500px] overflow-hidden transition-all duration-300">
          <div className="p-4 bg-blue-600 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-xl">🤖</span>
              <span className="font-semibold">Asisten AI Oneklik</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:opacity-80">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3 h-[300px] bg-gray-50/50">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 text-sm mt-10">
                Halo! Saya adalah AI Assistant Oneklik.<br/>
                Silakan tanyakan apa saja tentang fitur atau CV Anda.
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`p-3 rounded-xl text-sm max-w-[85%] ${msg.role === 'user' ? 'bg-blue-100 text-blue-900 ml-auto' : 'bg-white border border-gray-200 text-gray-800'}`}>
                {msg.content}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-gray-400 animate-pulse">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              </div>
            )}
          </div>

          <div className="p-4 border-t bg-white flex gap-2">
            <input 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tanyakan sesuatu..."
              disabled={isLoading}
            />
            <button 
              onClick={handleSend} 
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
            >
              Kirim
            </button>
          </div>
        </div>
      )}
    </div>
  );
}