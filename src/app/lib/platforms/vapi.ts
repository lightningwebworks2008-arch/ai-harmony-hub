/**
 * Fetch data from Vapi API
 * @param apiKey - Vapi API key (format: vapi_live_xxx)
 * @returns Object with success flag and call records
 */
export async function fetchVapiData(apiKey: string): Promise<{
  success: boolean;
  records: unknown[];
  error?: string;
}> {
  try {
    const response = await fetch('https://api.vapi.ai/call', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Vapi API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Vapi returns { calls: [...] } or just [...]
    const records = Array.isArray(data) ? data : (data.calls || []);
    
    return {
      success: true,
      records
    };
  } catch (error) {
    return {
      success: false,
      records: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}