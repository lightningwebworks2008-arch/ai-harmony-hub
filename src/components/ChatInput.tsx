import { useState, KeyboardEvent } from 'react';
import { ArrowRight } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, disabled = false, placeholder = "Type your message..." }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-[#0d0d0d] p-4">
      <div className="max-w-2xl mx-auto flex items-center gap-3">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-3 text-[#e5e5e5] placeholder:text-[#666] focus:outline-none focus:border-[#444] transition-all disabled:opacity-50 text-sm"
        />
        <button
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          className="p-3 rounded-lg bg-white text-black hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Send message"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
