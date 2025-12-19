"use client";

import { useState } from 'react';
import { C1Chat } from "@thesysai/genui-sdk";
import { AgentSelectionCard } from './components/AgentSelectionCard';
import "@crayonai/react-ui/styles/index.css";

export default function Home() {
  const [showAgentCard, setShowAgentCard] = useState(true);

  const handleSelectAgent = (agent: string) => {
    console.log('Selected agent:', agent);
    setShowAgentCard(false);
    // TODO: Send to chat API
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <C1Chat apiUrl="/api/chat" theme={{ mode: "dark" }} />
      
      {showAgentCard && (
        <div style={{
          position: 'absolute',
          top: '120px',
          left: '340px',
          zIndex: 10,
          pointerEvents: 'none'
        }}>
          <div style={{ pointerEvents: 'all' }}>
            <AgentSelectionCard onSelectAgent={handleSelectAgent} />
          </div>
        </div>
      )}
    </div>
  );
}
