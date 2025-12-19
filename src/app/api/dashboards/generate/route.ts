// Agent 1's SSE streaming pattern adapted for Getflowetic

import { OpenAI } from "openai";
import { GETFLOWETIC_SYSTEM_PROMPT } from "@/app/config/system-prompts";
import { analyzeWebhookPayloadSchema } from "@/app/lib/dashboard-tools/toolDefs";
import { analyzeWebhookPayload } from "@/app/lib/dashboard-tools/implementations/analyzeWebhookPayload";
import { generateDashboardSpecification } from "@/app/lib/dashboard-tools/implementations/generateDashboardSpecification";
import { previewWithSampleData } from "@/app/lib/dashboard-tools/implementations/previewWithSampleData";
import { matchBestTemplate } from "@/app/lib/dashboard-tools/templates/registry";
import { zodToJsonSchema } from "zod-to-json-schema";

export async function POST(request: Request) {
  const { webhookData } = await request.json();

  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  // Initialize OpenAI client pointing to Thesys
  const client = new OpenAI({
    apiKey: process.env.THESYS_API_KEY!,
    baseURL: "https://api.thesys.dev/v1/embed/",
  });

  // Thinking state writer
  const writeThinkingState = (state: { title: string; description: string }) => {
    writer.write(
      encoder.encode(`data: ${JSON.stringify({ type: 'thinking', ...state })}\n\n`)
    );
  };

  // Define tools using the proper OpenAI format
  const tools = [
    {
      type: "function" as const,
      function: {
        name: "analyze_webhook_payload",
        description: "Analyzes webhook JSON to detect field types, data patterns, and relationships",
        parameters: zodToJsonSchema(analyzeWebhookPayloadSchema),
      },
    },
    {
      type: "function" as const,
      function: {
        name: "generate_dashboard_specification", 
        description: "Generates complete dashboard specification with auto-matched template",
        parameters: {
          type: "object",
          properties: {
            schema: {
              type: "object",
              properties: {
                fields: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      type: { type: "string" },
                      format: { type: "string" }
                    }
                  }
                }
              }
            },
            customizations: { type: "object" }
          }
        },
      },
    },
    {
      type: "function" as const,
      function: {
        name: "preview_with_sample_data",
        description: "Validates dashboard spec against sample data", 
        parameters: {
          type: "object",
          properties: {
            specification: { type: "object" },
            sampleData: { type: "string" }
          }
        },
      },
    }
  ];

  // Start generation in background
  (async () => {
    try {
      const completion = await client.chat.completions.create({
        model: "c1/openai/gpt-5/v-20251130",
        messages: [
          { role: "system", content: GETFLOWETIC_SYSTEM_PROMPT },
          { 
            role: "user", 
            content: `Generate a dashboard for this webhook data:\n${JSON.stringify(webhookData, null, 2)}` 
          }
        ],
        tools,
        tool_choice: "auto",
      });
      
      const message = completion.choices[0]?.message;
      
      if (message?.tool_calls) {
        for (const toolCall of message.tool_calls) {
          const functionName = toolCall.function.name;
          const functionArgs = JSON.parse(toolCall.function.arguments || '{}');
          
          if (functionName === 'analyze_webhook_payload') {
            writeThinkingState({ title: "Analyzing webhook data...", description: "Detecting field types and data structure" });
            const result = await analyzeWebhookPayload(functionArgs);
            writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'tool_result', tool: functionName, result })}\n\n`));
          } else if (functionName === 'generate_dashboard_specification') {
            writeThinkingState({ title: "Generating dashboard...", description: "Creating widgets and layout specification" });
            const result = await generateDashboardSpecification(functionArgs);
            writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'tool_result', tool: functionName, result })}\n\n`));
          } else if (functionName === 'preview_with_sample_data') {
            writeThinkingState({ title: "Validating dashboard...", description: "Testing spec with sample webhook data" });
            const result = await previewWithSampleData(functionArgs);
            writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'tool_result', tool: functionName, result })}\n\n`));
          }
        }
      }
      
      writer.write(
        encoder.encode(`data: ${JSON.stringify({ type: 'complete', result: message?.content || 'Dashboard generation completed' })}\n\n`)
      );
    } catch (error) {
      console.error("Dashboard generation failed:", error);
      writer.write(
        encoder.encode(`data: ${JSON.stringify({ type: 'error', error: String(error) })}\n\n`)
      );
    } finally {
      await writer.close();
    }
  })();

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
