import React, { useState } from 'react';


interface ChatInputProps {
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isLoading) return;
    onSendMessage(text);
    setText('');
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white flex items-center gap-3">
      <input
        type="text"
        className="flex-1 rounded-full border border-gray-300 py-2.5 px-5 text-[15px] outline-none transition-all placeholder-gray-500 text-gray-900 hover:border-gray-400 focus:border-gray-500"
        placeholder="Message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={isLoading}
      />
      {text.trim() && !isLoading && (
        <button 
          type="submit" 
          className="text-blue-500 font-semibold px-2 animate-in fade-in transition-all text-[15px] hover:text-blue-700"
        >
          Send
        </button>
      )}
      {isLoading && (
        <span className="text-gray-400 px-2 flex justify-center">...</span>
      )}
    </form>
  );
};
