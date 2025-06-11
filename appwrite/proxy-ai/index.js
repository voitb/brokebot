export default async ({ req, res, log, error }) => {
    if (req.method !== "POST") {
      return res.send("Method Not Allowed", 405);
    }
  
        let body;
    try {
      body = JSON.parse(req.body);
    } catch (e) {
      return res.json({ error: "Invalid JSON format." }, 400);
    }

    const { model, messages, api_key } = body;

    // Get API key from request (passed from client) or fallback to environment
    const apiKey = api_key || process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      error("OpenRouter API key not provided");
      return res.json({ error: "OpenRouter API key not provided. Please configure your API key." }, 400);
    }
  
    if (!model || !Array.isArray(messages) || messages.length === 0) {
      return res.json(
        { error: "Fields 'model' and 'messages' (as non-empty array) are required." },
        400,
      );
    }
  
    log(`Forwarding request to model: ${model} with ${messages.length} messages`);
    log(`Messages preview: ${JSON.stringify(messages.slice(0, 2))}...`);
  
    try {
      log(`Making request to OpenRouter with API key: ${apiKey ? 'SET' : 'NOT SET'}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout
      
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:5173", // Your app URL
          "X-Title": "Local GPT", // Your app name
        },
        body: JSON.stringify({
          model: model,
          messages: messages,
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (response.ok) {
        const responseData = await response.json();
        return res.json(responseData, response.status);
      } else {
        const errorText = await response.text();
        error(`OpenRouter API error: ${response.status} - ${errorText}`);
        return res.json({ error: "External API error." }, response.status);
      }
    } catch (e) {
      error(`Internal error while communicating with OpenRouter: ${e.message}`);
      return res.json({ error: "Server error occurred." }, 500);
    }
  };