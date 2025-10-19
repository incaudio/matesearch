declare global {
  interface Window {
    puter: {
      ai: {
        chat: (message: string | any, options?: any) => Promise<string>;
        txt2img: (prompt: string, options?: any) => Promise<HTMLImageElement>;
      };
      print: (content: any) => void;
    };
  }
}

export interface PuterAIOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface PuterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function puterChat(
  messages: PuterMessage[],
  options: PuterAIOptions = {}
): Promise<string> {
  if (typeof window === 'undefined' || !window.puter) {
    throw new Error('Puter.js is not loaded. Make sure the script is included in your HTML.');
  }

  const {
    model = 'gpt-5-nano',
    temperature = 0.7,
    max_tokens = 400,
  } = options;

  const systemMessage = messages.find(m => m.role === 'system')?.content || '';
  const userMessage = messages[messages.length - 1]?.content || '';
  
  const fullPrompt = systemMessage 
    ? `${systemMessage}\n\nUser: ${userMessage}` 
    : userMessage;

  try {
    const response = await window.puter.ai.chat(fullPrompt, {
      model,
      temperature,
      max_tokens,
    });

    return response;
  } catch (error) {
    console.error('Puter AI error:', error);
    throw new Error('Failed to get AI response from Puter');
  }
}

export async function puterChatStreaming(
  messages: PuterMessage[],
  onChunk: (text: string) => void,
  options: PuterAIOptions = {}
): Promise<void> {
  if (typeof window === 'undefined' || !window.puter) {
    throw new Error('Puter.js is not loaded. Make sure the script is included in your HTML.');
  }

  const {
    model = 'gpt-5-nano',
    temperature = 0.7,
    max_tokens = 400,
  } = options;

  const systemMessage = messages.find(m => m.role === 'system')?.content || '';
  const userMessage = messages[messages.length - 1]?.content || '';
  
  const fullPrompt = systemMessage 
    ? `${systemMessage}\n\nUser: ${userMessage}` 
    : userMessage;

  try {
    const response = await window.puter.ai.chat(fullPrompt, {
      model,
      temperature,
      max_tokens,
      stream: true,
    });

    for await (const part of response as any) {
      if (part?.text) {
        onChunk(part.text);
      }
    }
  } catch (error) {
    console.error('Puter AI streaming error:', error);
    throw new Error('Failed to stream AI response from Puter');
  }
}

export async function puterGenerateImage(
  prompt: string,
  options: { model?: string } = {}
): Promise<HTMLImageElement> {
  if (typeof window === 'undefined' || !window.puter) {
    throw new Error('Puter.js is not loaded. Make sure the script is included in your HTML.');
  }

  const { model = 'gpt-image-1' } = options;

  try {
    const imageElement = await window.puter.ai.txt2img(prompt, { model });
    return imageElement;
  } catch (error) {
    console.error('Puter image generation error:', error);
    throw new Error('Failed to generate image with Puter');
  }
}

export const AVAILABLE_MODELS = {
  text: [
    'gpt-5',
    'gpt-5-mini',
    'gpt-5-nano',
    'gpt-5-chat-latest',
    'gpt-4.1',
    'gpt-4.1-mini',
    'gpt-4.1-nano',
    'gpt-4.5-preview',
    'gpt-4o',
    'gpt-4o-mini',
    'o1',
    'o1-mini',
    'o1-pro',
    'o3',
    'o3-mini',
    'o4-mini',
  ],
  image: [
    'gpt-image-1',
    'dall-e-3',
    'dall-e-2',
  ],
};
