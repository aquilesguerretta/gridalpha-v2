// FUTURE: Move API calls to FastAPI backend on Railway (gridalpha-v2-production.up.railway.app)
// to keep the Anthropic API key server-side. dangerouslyAllowBrowser is dev-only.

import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_PROMPT } from '@/lib/prompts/systemPrompt';

const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;

if (!apiKey && import.meta.env.DEV) {
  console.warn(
    'VITE_ANTHROPIC_API_KEY not set. AI Assistant will not function. ' +
      'Add the key to .env.local and restart the dev server.',
  );
}

const client = apiKey
  ? new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
  : null;

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface StreamChunk {
  type: 'text' | 'done' | 'error';
  text?: string;
  error?: string;
}

export const isApiKeyConfigured = (): boolean => Boolean(apiKey);

export async function* streamChat(
  messages: ChatMessage[],
  contextBlock: string,
): AsyncGenerator<StreamChunk> {
  if (!client) {
    yield {
      type: 'error',
      error:
        'AI Assistant unavailable. Add VITE_ANTHROPIC_API_KEY to .env.local and restart the dev server.',
    };
    return;
  }

  try {
    const stream = client.messages.stream({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      system: `${SYSTEM_PROMPT}\n\n--- CURRENT CONTEXT ---\n${contextBlock}`,
      messages,
    });

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        yield { type: 'text', text: event.delta.text };
      }
    }

    yield { type: 'done' };
  } catch (error) {
    yield {
      type: 'error',
      error:
        error instanceof Error
          ? error.message
          : 'Unknown error contacting Anthropic API',
    };
  }
}
