export async function generateText(prompt: string, type: 'page' | 'component', stream = false) {
  try {
    console.log('Sending request to AI service:', { prompt, type, stream });

    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        type,
        stream
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('AI service error:', errorData);
      throw new Error(`AI service error: ${response.status} ${errorData}`);
    }

    const data = await response.json();
    return data.completion;
  } catch (error) {
    console.error('Error in generateText:', error);
    throw error;
  }
} 