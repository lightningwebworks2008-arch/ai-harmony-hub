import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../lib/supabase-server';
import { encrypt, getEncryptionKey } from '../../../lib/security/encryption/aes-gcm';
import { fetchPlatformData } from '../../../lib/platforms/fetcher';
import { analyzeWebhookPayload } from '../../../lib/dashboard-tools/implementations/analyzeWebhookPayload';

export async function POST(req: NextRequest) {
  try {
    // 1. Parse request body
    const body = await req.json();
    const { 
      platform, 
      apiKey, 
      clientId,
      agencyId,
      instanceUrl,    // For n8n
      scenarioId,     // For Make.com
      connectionName 
    } = body;
    
    // 2. Validate required fields
    if (!platform || !apiKey || !clientId || !agencyId) {
      return NextResponse.json(
        { error: 'Missing required fields: platform, apiKey, clientId, agencyId' },
        { status: 400 }
      );
    }
    
    // 3. Test platform connection
    console.log(`[Connect Platform] Testing ${platform} connection for client ${clientId}`);
    
    const platformData = await fetchPlatformData(platform, apiKey, {
      instanceUrl,
      scenarioId
    });
    
    if (!platformData.success) {
      console.error(`[Connect Platform] Connection failed:`, platformData.error);
      return NextResponse.json(
        { 
          error: 'Connection test failed', 
          details: platformData.error 
        },
        { status: 400 }
      );
    }
    
    console.log(`[Connect Platform] Successfully fetched ${platformData.records.length} records`);
    
    // 4. Analyze schema using existing AI tool
    const sampleRecord = platformData.records[0] || {};
    const schemaAnalysis = await analyzeWebhookPayload({
      payload: JSON.stringify(sampleRecord),
      platformType: platform as 'vapi' | 'retell' | 'n8n' | 'make' | 'custom'
    });
    
    if (!schemaAnalysis.success) {
      return NextResponse.json(
        { error: 'Failed to analyze data schema', details: schemaAnalysis.error },
        { status: 500 }
      );
    }
    
    console.log(`[Connect Platform] Schema detected with ${schemaAnalysis.schema?.fields?.length || 0} fields`);
    
    // 5. Encrypt API key
    const encryptionKey = getEncryptionKey();
    const encrypted = encrypt(apiKey, encryptionKey);
    
    // 6. Store in Supabase
    const supabase = createServerSupabaseClient();
    
    const { data: connection, error: insertError } = await supabase
      .from('data_connections')
      .insert({
        client_id: clientId,
        agency_id: agencyId,
        name: connectionName || `${platform} connection`,
        platform,
        api_key_encrypted: encrypted.ciphertext,
        api_key_iv: encrypted.iv,
        api_key_tag: encrypted.tag,
        api_endpoint: instanceUrl || null,
        detected_schema: schemaAnalysis.schema || { fields: [] },
        sample_data: platformData.records.slice(0, 100) as Record<string, unknown>[], // Store first 100 records
        status: 'active',
        last_synced_at: new Date().toISOString()
      })
      .select('id, detected_schema, status')
      .single();
    
    if (insertError) {
      console.error('[Connect Platform] Database error:', insertError);
      return NextResponse.json(
        { error: 'Failed to save connection' },
        { status: 500 }
      );
    }
    
    // 7. Update client status
    await supabase
      .from('clients')
      .update({ 
        status: 'connected',
        updated_at: new Date().toISOString()
      })
      .eq('id', clientId);
    
    console.log(`[Connect Platform] Connection ${connection.id} created successfully`);
    
    // 8. Return success
    return NextResponse.json({
      success: true,
      connectionId: connection.id,
      recordCount: platformData.records.length,
      schema: connection.detected_schema,
      status: connection.status
    });
    
  } catch (error) {
    console.error('[Connect Platform] Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}