"use client";

import { useState } from 'react';
import { AgentSelectionCard } from './components/AgentSelectionCard';

export default function Home() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const handleSelectAgent = (agent: string) => {
    console.log('Selected agent:', agent);
    setSelectedAgent(agent);
    // TODO: Navigate to next step (webhook configuration)
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '20px'
    }}>
      <AgentSelectionCard onSelectAgent={handleSelectAgent} />
    </div>
  );
}
