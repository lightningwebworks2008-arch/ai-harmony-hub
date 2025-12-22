import { useState } from 'react';
import { Plus, PanelLeftClose, PanelLeft, MessageSquare } from 'lucide-react';
import sidebarIcon from '@/assets/sidebar-icon.ico';

interface ChatSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  onNewChat: () => void;
}

export function ChatSidebar({ isCollapsed, onToggle, onNewChat }: ChatSidebarProps) {
  const [chatHistory] = useState<{ id: string; title: string }[]>([]);

  if (isCollapsed) {
    return (
      <div className="h-full py-3 pl-3">
        <div className="h-full w-14 bg-sidebar border border-border rounded-xl flex flex-col items-center py-4">
          <button
            onClick={onToggle}
            className="p-2 border border-border rounded-lg hover:bg-sidebar-accent text-sidebar-foreground transition-colors"
            aria-label="Expand sidebar"
          >
            <PanelLeft className="h-5 w-5" />
          </button>
          <button
            onClick={onNewChat}
            className="mt-4 p-2 border border-border rounded-lg hover:bg-sidebar-accent transition-colors"
            aria-label="New chat"
          >
            <img src={sidebarIcon} alt="Menu" className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full py-3 pl-3">
      <div className="h-full w-64 bg-sidebar border border-border rounded-xl flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button className="p-2 border border-border rounded-lg hover:bg-sidebar-accent transition-colors">
          <img src={sidebarIcon} alt="Menu" className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold text-sidebar-foreground flex-1">C1 Chat</h1>
        <button
          onClick={onToggle}
          className="p-2 border border-border rounded-lg hover:bg-sidebar-accent text-sidebar-foreground transition-colors"
          aria-label="Collapse sidebar"
        >
          <PanelLeftClose className="h-5 w-5" />
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg bg-white text-black hover:bg-gray-100 transition-colors font-medium"
        >
          <span>New Chat</span>
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        {chatHistory.length > 0 && (
          <div className="space-y-1">
            {chatHistory.map((chat) => (
              <button
                key={chat.id}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground text-sm text-left transition-colors"
              >
                <MessageSquare className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{chat.title}</span>
              </button>
            ))}
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
