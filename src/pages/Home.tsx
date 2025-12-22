'use client';

import { useState } from 'react';
import { AgentSelectionCard } from '@/components/AgentSelectionCard';
import { ChatLayout } from '@/components/ChatLayout';
import "@crayonai/react-ui/styles/index.css";

export default function Home() {
  const [showAgentCard, setShowAgentCard] = useState(true);
  const [webhookStatus, setWebhookStatus] = useState<'waiting' | 'connected' | null>(null);

  const handleSelectAgent = async (agent: string) => {
    console.log('Selected agent:', agent);
    setShowAgentCard(false);
    
    if (agent === 'webhook') {
      setWebhookStatus('waiting');
    }
  };

  const handleSendMessage = (message: string) => {
    console.log('User message:', message);
    // TODO: Implement chat functionality
  };

  return (
    <ChatLayout showChatInput={!showAgentCard} onSendMessage={handleSendMessage}>
      <div className="flex items-center justify-center min-h-full p-8">
        {showAgentCard ? (
          <AgentSelectionCard onSelectAgent={handleSelectAgent} />
        ) : (
          <div className="text-center">
            <h2 className="text-xl font-medium text-muted-foreground mb-4">
              Agent Selected
            </h2>
            <p className="text-sm text-muted-foreground">
              Chat interface coming soon - requires Edge Function setup
            </p>
          </div>
        )}
      </div>
      
      {webhookStatus === 'waiting' && (
        <div className="fixed bottom-5 right-5 bg-primary text-primary-foreground px-6 py-4 rounded-xl text-sm font-medium shadow-lg z-50">
          ⏳ Listening for webhook events...
        </div>
      )}
    </ChatLayout>
  );
}
