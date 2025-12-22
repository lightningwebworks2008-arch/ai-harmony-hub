import { useState, KeyboardEvent } from 'react';
import { ArrowRight } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  sidebarCollapsed?: boolean;
}

export function ChatInput({ 
  onSend, 
  disabled = false, 
  placeholder = "Type your message...",
  sidebarCollapsed = false 
}: ChatInputProps) {
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
    <div 
      className="fixed bottom-8 left-0 right-0 flex justify-center pointer-events-none z-50"
      style={{ 
        paddingLeft: sidebarCollapsed ? '64px' : '256px'
      }}
    >
      <div className="w-full max-w-2xl px-4 pointer-events-auto">
        <div className="bg-card border border-border rounded-2xl shadow-lg p-2">
          <div className="flex items-center bg-background border border-border rounded-xl px-4 py-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={disabled || !message.trim()}
              className="p-2 rounded-lg bg-white text-black hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              aria-label="Send message"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
