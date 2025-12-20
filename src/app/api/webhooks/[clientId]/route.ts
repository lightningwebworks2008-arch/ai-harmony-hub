
import { NextRequest, NextResponse } from 'next/server';
import { getDashboardGenerationTools } from '@/app/lib/dashboard-tools';
import { getSystemPrompt } from '@/app/config/system-prompts';
import OpenAI from 'openai';
import { saveSpec } from '@/app/lib/dashboard-tools/specStore';

// Store received webhooks in memory (temporary - will use database later)
type WebhookEvent = Readonly<{
  timestamp: string;
  data: unknown;
}>;

const webhookStore = new Map<string, WebhookEvent[]>();

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ clientId: string }> }
) {
  const { clientId } = await context.params;
  try {
    const webhookData = await request.json() as Record<string, unknown>;

    console.log(`[Webhook] Received for client ${clientId}:`, webhookData);

    // Store the webhook event
    if (!webhookStore.has(clientId)) {
      webhookStore.set(clientId, []);
    }
    webhookStore.get(clientId)!.push({
      timestamp: new Date().toISOString(),
      data: webhookData
    });

    // Generate dashboard using real AI
    const apiKey = process.env.THESYS_API_KEY;
    
    if (apiKey && apiKey !== '') {
      const client = new OpenAI({
        baseURL: "https://api.thesys.dev/v1/embed/",
        apiKey,
      });

      // Capture intermediate thinking states into an array (for logging/debugging only)
      const progressMessages: string[] = [];
      const writeThinkingState = (state: { title: string; description: string }) => {
        progressMessages.push(`${state.title}: ${state.description}`);
      };

      const tools = getDashboardGenerationTools(writeThinkingState);

      // Run tools via the OpenAI helper. This automatically invokes any tools
      // called by the model and emits events as content/messages.
      const runToolsResponse = client.beta.chat.completions.runTools({
        model: "c1/openai/gpt-4o/v-20241120",
        messages: [
          { role: "system", content: getSystemPrompt() },
          {
            role: "user",
            content: `Analyze this webhook data and generate a dashboard specification:\n\n${JSON.stringify(webhookData)}`,
          },
        ],
        tools,
        stream: true,
      });

      // Save the generated specification exactly once
      let specSaved = false;
      runToolsResponse.on("message", async (message) => {
        // Tool result messages have role 'tool' and include the tool name and JSON content
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const msg: any = message;
        if (
          !specSaved &&
          msg.role === "tool" &&
          msg.name === "generate_dashboard_specification" &&
          typeof msg.content === "string"
        ) {
          try {
            const result = JSON.parse(msg.content);
            if (result && result.specification) {
              const specToSave = {
                ...result.specification,
                sampleData: webhookData,
                createdAt: Date.now(),
              };
              await saveSpec(clientId, specToSave);
              specSaved = true;
              console.log(`[Webhook] Dashboard generated and saved for client ${clientId}`);
            }
          } catch (err) {
            console.error("Failed to parse tool result", err);
          }
        }
      });

      // Wait for completion
      await new Promise<void>((resolve, reject) => {
        runToolsResponse.on("end", () => resolve());
        runToolsResponse.on("error", (err) => reject(err));
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Webhook received and dashboard generated',
      clientId 
    });

  } catch (error) {
    console.error('[Webhook] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

// Allow GET to check webhook status
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ clientId: string }> }
) {
  const { clientId } = await context.params;
  const events = webhookStore.get(clientId) || [];
  
  return NextResponse.json({
    clientId,
    eventCount: events.length,
    events: events.slice(-5) // Return last 5 events
  });
}
