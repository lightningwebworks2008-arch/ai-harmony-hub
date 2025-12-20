'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DashboardGenerationFormProps {
  agent: string | null;
}

export function DashboardGenerationForm({ agent }: DashboardGenerationFormProps) {
  const [webhookJson, setWebhookJson] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<string[]>([]);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleGenerate = async () => {
    setIsGenerating(true);
    setProgress([]);
    setError(null);
    setPreviewId(null);
    
    try {
      // Validate JSON
      JSON.parse(webhookJson);
      
      const response = await fetch('/api/dashboards/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          webhookData: webhookJson,
          agent: agent,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate dashboard');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = JSON.parse(line.slice(6));

              if (data.type === 'thinking') {
                setProgress(prev => [...prev, `${data.title}: ${data.description}`]);
              } else if (data.type === 'preview_ready') {
                setPreviewId(data.previewId);
                setIsGenerating(false);
              } else if (data.type === 'error') {
                setError(data.message);
                setIsGenerating(false);
              }
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON format');
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Webhook JSON Data
        </label>
        <textarea
          value={webhookJson}
          onChange={(e) => setWebhookJson(e.target.value)}
          placeholder='{"event": "call_ended", "duration": 180, ...}'
          className="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isGenerating}
        />
      </div>
      
      <button
        onClick={handleGenerate}
        disabled={isGenerating || !webhookJson.trim()}
        className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isGenerating ? 'Generating Dashboard...' : 'Generate Dashboard'}
      </button>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">Error</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      )}
      
      {progress.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 font-medium mb-2">Generation Progress:</p>
          <div className="space-y-2">
            {progress.map((msg, i) => (
              <div key={i} className="text-blue-700 text-sm flex items-start">
                <span className="mr-2">•</span>
                <span>{msg}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {previewId && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-medium mb-3">Dashboard Generated Successfully!</p>
          <button
            onClick={() => router.push(`/dashboard/preview/${previewId}`)}
            className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            View Dashboard
          </button>
        </div>
      )}
    </div>
  );
}