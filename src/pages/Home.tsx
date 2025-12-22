import { useState, useEffect } from 'react';
import { AgentSelectionCard } from '@/components/AgentSelectionCard';
import "@crayonai/react-ui/styles/index.css";

// Note: C1Chat will need Edge Function backend - placeholder for now
export default function Home() {
  const [showAgentCard, setShowAgentCard] = useState(true);
  const [webhookClientId, setWebhookClientId] = useState<string | null>(null);
  const [webhookStatus, setWebhookStatus] = useState<'waiting' | 'connected' | null>(null);

  const handleSelectAgent = async (agent: string) => {
    console.log('Selected agent:', agent);
    setShowAgentCard(false);
    
    if (agent === 'webhook') {
      const clientId = `client_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      setWebhookClientId(clientId);
      setWebhookStatus('waiting');
      // TODO: Implement webhook setup via Edge Function
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-background text-foreground">
      <div className="flex items-center justify-center min-h-screen p-8">
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
    </div>
  );
}
