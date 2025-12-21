/**
 * Fetch data from n8n API
 * @param apiKey - n8n API key
 * @param instanceUrl - n8n instance URL (e.g., https://my-n8n.app.n8n.cloud)
 * @returns Object with success flag and execution records
 */
export async function fetchN8nData(
  apiKey: string,
  instanceUrl: string
): Promise<{
  success: boolean;
  records: unknown[];
  error?: string;
}> {
  try {
    if (!instanceUrl) {
      throw new Error('n8n instance URL is required');
    }
    
    const url = `${instanceUrl.replace(/\/$/, '')}/api/v1/executions`;
    
    const response = await fetch(url, {
      headers: {
        'X-N8N-API-KEY': apiKey
      }
    });
    
    if (!response.ok) {
      throw new Error(`n8n API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      success: true,
      records: data.data || []
    };
  } catch (error) {
    return {
      success: false,
      records: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}