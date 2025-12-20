import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { transformStream } from "@crayonai/stream";
import { DBMessage, getMessageStore } from "./messageStore";
import { getDashboardGenerationTools } from "@/app/lib/dashboard-tools";
import { getSystemPrompt } from "@/app/config/system-prompts";

export async function POST(req: NextRequest) {
  const { prompt, threadId, responseId } = (await req.json()) as {
    prompt: DBMessage;
    threadId: string;
    responseId: string;
  };

  const client = new OpenAI({
    baseURL: "https://api.thesys.dev/v1/embed/",
    apiKey: process.env.THESYS_API_KEY,
  });
  
  const messageStore = getMessageStore(threadId);

  // Check if user is requesting webhook setup
  if (typeof prompt.content === 'string' && 
      (prompt.content.toLowerCase().includes('webhook') || 
       prompt.content.toLowerCase().includes('client id'))) {
    
    // Extract webhook URL and client ID if present
    const urlMatch = prompt.content.match(/https:\/\/getflowetic\.com\/api\/webhooks\/([a-zA-Z0-9_-]+)/);
    
    if (urlMatch) {
      const webhookUrl = urlMatch[0];
      
      const responseMessage = `I've created your webhook URL:

**${webhookUrl}**

📋 **Setup Instructions:**

1. **Copy the URL above**
2. **Add it to your platform:**
   - Vapi: Dashboard → Server URL → Paste URL
   - Retell: Settings → Webhook URL → Paste URL
   - n8n: Webhook node → Production URL → Deploy
   - Make: Webhooks → Custom Webhook → Paste URL

3. **Send a test event**

I'm now listening for webhook data. Once you send a test event, I'll automatically:
- Detect your data structure
- Match it to the best dashboard template
- Generate a preview for you

⏳ **Status:** Waiting for first webhook event...`;

      await messageStore.addMessage(prompt);
      await messageStore.addMessage({
        role: "assistant",
        content: responseMessage,
        id: responseId,
      });

      const stream = new ReadableStream({
        start(controller) {
          const encoder = new TextEncoder();
          controller.enqueue(encoder.encode(responseMessage));
          controller.close();
        }
      });

      return new NextResponse(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
        },
      });
    }
  }

  // Initialize dashboard generation tools
  const tools = getDashboardGenerationTools(async (state) => {
    console.log('[Tool Execution]', state);
  });

  // Get conversation history
  const conversationHistory = await messageStore.getOpenAICompatibleMessageList();

  // Save user message before processing
  await messageStore.addMessage(prompt);

  // Normal AI chat with custom system prompt and tools
  const llmStream = await client.chat.completions.create({
    model: "c1/openai/gpt-5/v-20251130",
    messages: [
      {
        role: "system",
        content: getSystemPrompt()
      },
      ...conversationHistory
    ],
    tools: tools.map(tool => ({
      type: "function" as const,
      function: {
        name: tool.function.name,
        description: tool.function.description,
        parameters: tool.function.parameters,
      }
    })),
    tool_choice: "auto",
    stream: true,
  });

  const responseStream = transformStream(
    llmStream,
    (chunk) => {
      return chunk.choices?.[0]?.delta?.content ?? "";
    },
    {
      onEnd: async ({ accumulated }) => {
        const message = accumulated.filter((message) => message).join("");
        await messageStore.addMessage({
          role: "assistant",
          content: message,
          id: responseId,
        });
      },
    }
  ) as ReadableStream<string>;

  return new NextResponse(responseStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
