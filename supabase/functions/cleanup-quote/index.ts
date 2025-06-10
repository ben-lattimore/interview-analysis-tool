
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { text } = await req.json();

    if (!text) {
      throw new Error('Quote text is required');
    }

    console.log('Cleaning up quote:', text);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a text editor that cleans up spoken quotes to make them more readable while preserving their original meaning and tone. Your tasks:

1. Fix grammar and punctuation errors
2. Remove filler words (um, uh, like, you know, etc.)
3. Complete incomplete sentences when the meaning is clear
4. Fix obvious word repetitions or false starts
5. Maintain the speaker's voice and meaning exactly
6. Keep the quote conversational and natural
7. Do not change the core message or add new information
8. Do not add quotation marks around the text - return only the cleaned text content

Return only the cleaned quote text without any quotation marks or additional formatting.`
          },
          {
            role: 'user',
            content: `Clean up this quote: "${text}"`
          }
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    let cleanedText = data.choices[0].message.content.trim();

    // Remove any surrounding quotation marks that the AI might have added
    cleanedText = cleanedText.replace(/^["']|["']$/g, '');

    console.log('Original:', text);
    console.log('Cleaned:', cleanedText);

    return new Response(JSON.stringify({ cleanedText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in cleanup-quote function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
