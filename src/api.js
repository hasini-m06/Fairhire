export async function analyzeForBias(prompt) {
  try {
    const response = await fetch('/api/audit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch audit results');
    }

    const data = await response.json();
    return data; // This will be the JSON result from Gemini
  } catch (error) {
    console.error("Frontend API Error:", error);
    throw error;
  }
}
