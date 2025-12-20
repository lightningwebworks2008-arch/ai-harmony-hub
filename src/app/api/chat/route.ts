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
      const clientId = urlMatch[1];
      
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

  // Handle tool calls from AI
  let toolResults: any[] = [];
  
  for await (const chunk of llmStream) {
    const toolCalls = chunk.choices[0]?.delta?.tool_calls;
    
    if (toolCalls) {
      for (const toolCall of toolCalls) {
        if (toolCall.function?.name && toolCall.function?.arguments) {
          const toolName = toolCall.function.name;
          const tool = tools.find(t => t.function.name === toolName);
          
          if (tool) {
            try {
              const args = JSON.parse(toolCall.function.arguments);
              const result = await tool.function.execute(args);
              toolResults.push({ tool: toolName, result });
              console.log(`[Tool Success] ${toolName}:`, result);
            } catch (error) {
              console.error(`[Tool Error] ${toolName}:`, error);
            }
          }
        }
      }
    }
  }

  // If tools were executed, make another LLM call with results
  if (toolResults.length > 0) {
    const finalLlmStream = await client.chat.completions.create({
      model: "c1/openai/gpt-5/v-20251130",
      messages: [
        {
          role: "system",
          content: getSystemPrompt()
        },
        ...conversationHistory,
        {
          role: "assistant",
          content: `I've analyzed the data using my tools. Here are the results: ${JSON.stringify(toolResults)}`
        }
      ],
      stream: true,
    });

    const finalResponseStream = transformStream(
      finalLlmStream,
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

    return new NextResponse(finalResponseStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  }

  // Save user message before processing
  await messageStore.addMessage(prompt);

  // Re-create stream for normal response (since we consumed it)
  const normalStream = await client.chat.completions.create({
    model: "c1/openai/gpt-5/v-20251130",
    messages: [
      {
        role: "system",
        content: getSystemPrompt()
      },
      ...conversationHistory
    ],
    stream: true,
  });

  // Continue with normal response stream
  const responseStream = transformStream(
    normalStream,
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
