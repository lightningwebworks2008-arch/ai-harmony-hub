/**
 * Fetch data from Make.com API
 * @param apiKey - Make API token
 * @param scenarioId - Make scenario ID
 * @returns Object with success flag and execution records
 */
export async function fetchMakeData(
  apiKey: string,
  scenarioId: string
): Promise<{
  success: boolean;
  records: unknown[];
  error?: string;
}> {
  try {
    if (!scenarioId) {
      throw new Error('Make scenario ID is required');
    }
    
    const response = await fetch(
      `https://us1.make.com/api/v2/scenarios/${scenarioId}/executions`,
      {
        headers: {
          'Authorization': `Token ${apiKey}`
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Make API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      success: true,
      records: data.executions || []
    };
  } catch (error) {
    return {
      success: false,
      records: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}