const MASSIVE_API_KEY = import.meta.env.VITE_MASSIVE_API_KEY;
const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;
const MASSIVE_BASE_URL = 'https://api.massive.com';
const DEEPSEEK_BASE_URL = '/api/deepseek'; // Use proxy path

// --- Massive API ---

export async function fetchStockDetails(ticker) {
  // Attempting V3 Ticker Details endpoint
  const url = `${MASSIVE_BASE_URL}/v3/reference/tickers/${ticker}?apiKey=${MASSIVE_API_KEY}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Massive API Error: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch details for ${ticker}:`, error);
    return null;
  }
}

export async function fetchStockQuote(ticker) {
  // Attempting V2 Previous Close (easy way to get a price)
  const url = `${MASSIVE_BASE_URL}/v2/aggs/ticker/${ticker}/prevClose?apiKey=${MASSIVE_API_KEY}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Massive API Error: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch quote for ${ticker}:`, error);
    return null;
  }
}

export async function fetchMarketStatus() {
  const url = `${MASSIVE_BASE_URL}/v1/marketstatus/now?apiKey=${MASSIVE_API_KEY}`;
  try {
     const response = await fetch(url);
     return await response.json();
  } catch(e) {
      console.error(e);
      return null;
  }
}


// --- DeepSeek API ---

export async function chatWithDeepSeek(messages, contextData = {}) {
  // RAG Context Injection
  const systemPrompt = {
    role: 'system',
    content: `You are a Stock Assessment AI Assistant.
    You have access to real-time market data.
    Current Stock Data Context: ${JSON.stringify(contextData)}
    
    Answer the user's questions about stocks using this data.
    Be concise, professional, and insightful.
    `
  };

  const payload = {
    model: 'deepseek-chat', // Verifying model name usage
    messages: [systemPrompt, ...messages],
    stream: false
  };

  try {
    const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`DeepSeek API Error: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`DeepSeek API Error: ${response.status}`);
    }
    const data = await response.json();
    return data.choices[0].message;
  } catch (error) {
    console.error('DeepSeek Chat Error:', error);
    // Return a more descriptive error in the chat for debugging
    return { role: 'assistant', content: `I'm having trouble connecting. Debug: ${error.message}` };
  }
}
