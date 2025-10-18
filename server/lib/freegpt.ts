// Music AI assistant - Uses AI API from https://github.com/matenations/AI
// Primary: https://ai-wtsg.onrender.com/chat/
// Fallback: Free AI APIs

import fetch from 'node-fetch';

// List of API endpoints to try in order
// Note: freegpt.cc is a web interface, not an API, so we use similar free AI APIs
const AI_ENDPOINTS = [
  {
    name: 'Primary API',
    url: 'https://ai-wtsg.onrender.com/chat/',
    buildBody: (query: string) => ({ message: query }),
    extractResponse: (data: any) => data.response || data.answer || data.reply || data.message || data.text,
    timeout: 45000, // Longer timeout for cold starts on Render
  },
  {
    name: 'Fallback API 1',
    url: 'https://free-unoficial-gpt4o-mini-api-g70n.onrender.com/chat/',
    buildBody: (query: string) => ({ message: query }),
    extractResponse: (data: any) => data.response || data.answer || data.reply || data.message,
    timeout: 30000,
  },
  {
    name: 'Fallback API 2',
    url: 'https://chatgpt-api.shn.hk/v1/',
    buildBody: (query: string) => ({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: query }]
    }),
    extractResponse: (data: any) => data.choices?.[0]?.message?.content || data.response || data.answer,
    timeout: 30000,
  }
];

async function tryEndpoint(endpoint: typeof AI_ENDPOINTS[0], query: string): Promise<string | null> {
  try {
    console.log(`[AI] Trying ${endpoint.name}...`);
    const response = await fetch(endpoint.url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(endpoint.buildBody(query)),
      signal: AbortSignal.timeout(endpoint.timeout),
    });
    
    if (!response.ok) {
      console.log(`[AI] ${endpoint.name} returned status ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    const aiResponse = endpoint.extractResponse(data);
    
    if (aiResponse && typeof aiResponse === 'string' && aiResponse.trim()) {
      console.log(`[AI] ${endpoint.name} succeeded`);
      return aiResponse;
    }
    
    return null;
  } catch (error: any) {
    console.log(`[AI] ${endpoint.name} failed:`, error.message);
    return null;
  }
}

export async function freegptChat({ messages, model = 'gpt-3.5-turbo', max_tokens = 400, temperature = 0.7 }) {
  const userMessage = messages[messages.length - 1]?.content || '';
  const systemMessage = messages.find(m => m.role === 'system')?.content || '';
  
  const query = systemMessage ? `${systemMessage}\n\nUser: ${userMessage}` : userMessage;
  
  // Try each endpoint in order
  for (const endpoint of AI_ENDPOINTS) {
    const result = await tryEndpoint(endpoint, query);
    if (result) {
      return result;
    }
  }
  
  // If all endpoints fail, return a helpful message
  console.error('[AI] All AI endpoints failed');
  return "I'm currently unable to connect to the AI service. The API may be waking up (this can take 30-60 seconds for free services). Please try again in a moment, or ask a specific music question.";
}
