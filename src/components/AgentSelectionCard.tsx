import './AgentSelectionCard.css';

interface AgentSelectionCardProps {
  onSelectAgent: (agent: string) => void;
}

export function AgentSelectionCard({ onSelectAgent }: AgentSelectionCardProps) {
  const agents = [
    { id: 'n8n', name: 'n8n', icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z' },
    { id: 'make', name: 'Make.com', icon: 'M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0M12 1v6m0 6v6M23 12h-6m-6 0H5' },
    { id: 'retell', name: 'Retell', icon: 'M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z' },
    { id: 'vapi', name: 'Vapi', icon: 'M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v2a7 7 0 01-14 0v-2M12 19v4m-4 0h8' },
    { id: 'webhook', name: 'Custom Webhook', icon: 'M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71' },
    { id: 'api', name: 'Custom API', icon: 'M16 18l6-6-6-6M8 6L2 12l6 6' },
  ];

  return (
    <div className="agent-card">
      <div className="agent-card-title">Select AI Agent</div>
      
      <div className="agent-button-grid">
        {agents.map((agent) => (
          <button
            key={agent.id}
            className="agent-button"
            onClick={() => onSelectAgent(agent.id)}
          >
            <svg className="agent-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d={agent.icon} />
            </svg>
            <div className="agent-name">{agent.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
