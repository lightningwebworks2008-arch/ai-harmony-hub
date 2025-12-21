import { fetchVapiData } from './vapi';
import { fetchRetellData } from './retell';
import { fetchN8nData } from './n8n';
import { fetchMakeData } from './make';

/**
 * Main platform data fetcher - routes to appropriate platform handler
 * @param platform - Platform type
 * @param apiKey - Platform API key
 * @param options - Platform-specific options
 * @returns Object with success flag and records
 */
export async function fetchPlatformData(
  platform: string,
  apiKey: string,
  options?: {
    instanceUrl?: string;
    scenarioId?: string;
  }
): Promise<{
  success: boolean;
  records: unknown[];
  error?: string;
}> {
  switch (platform) {
    case 'vapi':
      return fetchVapiData(apiKey);
      
    case 'retell':
      return fetchRetellData(apiKey);
      
    case 'n8n':
      if (!options?.instanceUrl) {
        return {
          success: false,
          records: [],
          error: 'n8n requires instanceUrl'
        };
      }
      return fetchN8nData(apiKey, options.instanceUrl);
      
    case 'make':
      if (!options?.scenarioId) {
        return {
          success: false,
          records: [],
          error: 'Make.com requires scenarioId'
        };
      }
      return fetchMakeData(apiKey, options.scenarioId);
      
    default:
      return {
        success: false,
        records: [],
        error: `Unknown platform: ${platform}`
      };
  }
}