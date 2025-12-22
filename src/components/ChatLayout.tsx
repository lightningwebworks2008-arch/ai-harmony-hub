import { useState, ReactNode } from 'react';
import { ChatSidebar } from './ChatSidebar';
import { ChatInput } from './ChatInput';

interface ChatLayoutProps {
  children: ReactNode;
  showChatInput?: boolean;
  onSendMessage?: (message: string) => void;
}

export function ChatLayout({ children, showChatInput = true, onSendMessage }: ChatLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleNewChat = () => {
    console.log('New chat started');
    // TODO: Implement new chat logic
  };

  const handleSendMessage = (message: string) => {
    console.log('Message sent:', message);
    onSendMessage?.(message);
  };

  return (
    <div className="flex h-screen w-full bg-background">
      {/* Sidebar */}
      <ChatSidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onNewChat={handleNewChat}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>

        {/* Chat Input */}
        {showChatInput && (
          <ChatInput onSend={handleSendMessage} />
        )}
      </div>
    </div>
  );
}
