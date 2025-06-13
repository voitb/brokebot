async function handleRequest(context)   {
  const { req, res, log, error } = context;

  if (req.headers['x-appwrite-user-id']) {
    log(`Proxying request for user: ${req.headers['x-appwrite-user-id']}`);
  } else {
    log('Proxying request for anonymous user.');
  }

  try {
    // Odczyt danych przesłanych z frontu
    const { model, messages, stream, api_key } = JSON.parse(req.body || '{}');

    // Używamy OpenRouter zamiast OpenAI.  Jeśli klucz nie został wysłany w body,
    // próbujemy pobrać go z ENV (ułatwia lokalne testy).
    const routerApiKey = api_key || process.env.OPENROUTER_API_KEY;
    if (!routerApiKey) {
      throw new Error('OpenRouter API key not provided.');
    }

    const targetUrl = 'https://openrouter.ai/api/v1/chat/completions';

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${routerApiKey}`,
      },
      body: JSON.stringify({ model, messages, stream: !!stream }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`OpenRouter error ${response.status}: ${errorBody}`);
    }

    // Otrzymujemy pełne body - nie streamujemy, aby Appwrite mógł zwrócić JSON (200)
    const data = await response.json();
    return res.json(data, 200);
  } catch (err) { 
    error(err.message);
    return res.json({ error: 'Failed to proxy request' }, 500);
  }
}

export default handleRequest; 