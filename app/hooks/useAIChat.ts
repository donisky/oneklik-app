'use client';

import { useState, useCallback } from 'react';

export const useAIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user'|'assistant', content: string}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // State Global untuk menyimpan data CV
  const [cvContext, setCvContext] = useState<any>(null);

  const sendMessage = useCallback(async (message: string, context?: any) => {
    if (!message.trim()) return;
    const newMessage = { role: 'user' as const, content: message };
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/groq-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: message, 
          cvContext: context || cvContext 
        })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Maaf, terjadi kesalahan jaringan.' }]);
    } finally {
      setIsLoading(false);
    }
  }, [cvContext]);

  return {
    isOpen, setIsOpen,
    messages, setMessages,
    input, setInput,
    isLoading,
    sendMessage,
    cvContext, setCvContext // Ekspor setCvContext agar bisa diisi dari halaman lain
  };
};