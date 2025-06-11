export default async ({ req, res, log, error }) => {
    if (req.method !== "POST") {
      return res.send("Method Not Allowed", 405);
    }
  
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      error("API key 'OPENROUTER_API_KEY' not set in function variables!");
      return res.json({ error: "Server configuration error." }, 500);
    }
  
    let body;
    try {
      body = JSON.parse(req.body);
    } catch (e) {
      return res.json({ error: "Invalid JSON format." }, 400);
    }
  
    const { model, messages } = body;
  
    if (!model || !Array.isArray(messages) || messages.length === 0) {
      return res.json(
        { error: "Fields 'model' and 'messages' (as non-empty array) are required." },
        400,
      );
    }
  
    log(`Forwarding request to model: ${model}`);
  
    try {
    //   const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    //     method: "POST",
    //     headers: {
    //       "Authorization": `Bearer ${apiKey}`,
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({
    //       model: model,
    //       messages: messages,
    //     }),
    //   });
  
    //   const responseBody = await response.text();
    //   res.header("Content-Type", response.headers.get("Content-Type"));
    //   return res.send(responseBody, response.status);

      const mockResponse = {
        id: "chatcmpl-mock-12345",
        object: "chat.completion",
        created: Math.floor(Date.now() / 1000),
        model: model || "mock-model/debug-v1",
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: ` '${model}' '${messages[messages.length - 1].content}'`,
            },
            finish_reason: "stop",
          },
        ],
        usage: {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0,
        },
      };
     
      return res.json(mockResponse);
    } catch (e) {
      error(`Internal error while communicating with OpenRouter: ${e.message}`);
      return res.json({ error: "Server error occurred." }, 500);
    }
  };