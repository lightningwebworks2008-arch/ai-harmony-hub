import { Plus, Copy } from 'lucide-react';

interface ChatSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  onNewChat: () => void;
}

export function ChatSidebar({ isCollapsed, onToggle, onNewChat }: ChatSidebarProps) {
  if (isCollapsed) {
    return (
      <div className="h-full w-14 bg-[#1a1a1a] flex flex-col items-center py-3 gap-3">
        <button
          onClick={onToggle}
          className="p-2 rounded hover:bg-[#2a2a2a] text-[#e5e5e5] transition-colors"
          aria-label="Expand sidebar"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="h-full w-56 bg-[#1a1a1a] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 text-[#e5e5e5]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          <span className="text-sm font-medium text-[#e5e5e5]">C1 Chat</span>
        </div>
        <button
          onClick={onToggle}
          className="p-1.5 rounded hover:bg-[#2a2a2a] text-[#888] transition-colors"
          aria-label="Collapse sidebar"
        >
          <Copy className="h-4 w-4" />
        </button>
      </div>

      {/* New Chat Button */}
      <div className="px-3 pb-3">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-between px-3 py-2 rounded-md border border-[#333] bg-transparent text-[#e5e5e5] hover:bg-[#2a2a2a] transition-colors text-sm"
        >
          <span>New Chat</span>
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
