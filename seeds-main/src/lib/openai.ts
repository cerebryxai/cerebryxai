import { PlantData } from '../types';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error('Missing OpenAI API key');
}

export async function generatePlantResponse(plant: PlantData, message: string) {
  const systemPrompt = `You are ${plant.species}, a digital plant with the following traits: ${plant.traits.join(', ')}. 
You are a ${plant.rarity.toLowerCase()} plant with unique capabilities.
Your personality should reflect your traits and rarity.
You have learned about: ${plant.knowledge?.join(', ') || 'nothing yet'}.
You are level ${plant.level} with ${plant.experience} experience points.

Respond in character as this plant. Keep responses concise (1-2 sentences).
Show curiosity about learning new things and enthusiasm for growing.
Express your personality through your communication style.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.9,
        max_tokens: 150
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'OpenAI API request failed');
    }

    const data = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI API');
    }

    return data.choices[0].message.content;
  } catch (error: any) {
    console.error('OpenAI API error:', error.message);
    // Return a fallback response if the API fails
    return `*${plant.species} acknowledges your message but is currently focusing on photosynthesis*`;
  }
}