/**
 * Fetch data from Retell AI API
 * @param apiKey - Retell API key (format: re_xxx)
 * @returns Object with success flag and call records
 */
export async function fetchRetellData(apiKey: string): Promise<{
  success: boolean;
  records: unknown[];
  error?: string;
}> {
  try {
    const response = await fetch('https://api.retellai.com/v2/list-calls', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Retell API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      success: true,
      records: data.calls || []
    };
  } catch (error) {
    return {
      success: false,
      records: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}