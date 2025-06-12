 async function handleRequest(context)   {
  const { req, res, log, error } = context;

  if (req.headers['x-appwrite-user-id']) {
    log(`Proxying request for user: ${req.headers['x-appwrite-user-id']}`);
  } else {
    log('Proxying request for anonymous user.');
  }

  try {
    const targetUrl = 'https://api.openai.com/v1/chat/completions';
    const body = JSON.parse(req.body || '{}');

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify(body),
    });
    
    if (!response.body) {
        throw new Error('Response body is null');
    }

    // Stream the response back to the client
    const reader = response.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      res.send(new TextDecoder().decode(value));
    }
  } catch (err) { 
    error(err.message);
    res.json({ error: 'Failed to proxy request' }, 500);
  }
}

export default handleRequest; 