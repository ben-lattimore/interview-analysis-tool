
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
    const { quote, participant, context } = await req.json();

    console.log('Cleaning up quote:', { quote, participant, context });

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
            content: `You are an expert editor specializing in cleaning up spoken quotes for readability while preserving their original meaning and tone. Your task is to:

1. Fix grammar, punctuation, and sentence structure
2. Remove filler words (um, uh, like, you know, etc.)
3. Correct obvious speech-to-text errors
4. Make the quote flow better while keeping the speaker's voice
5. Preserve the core message and sentiment exactly
6. Keep the quote roughly the same length
7. Maintain any technical terms or specific language choices that seem intentional

Do NOT:
- Change the meaning or sentiment
- Add information not present in the original
- Make it sound overly formal if the speaker was casual
- Remove important context or nuance
- Alter the speaker's intended emphasis or point

Return only the cleaned quote without any additional commentary or quotation marks.`
          },
          {
            role: 'user',
            content: `Please clean up this quote from ${participant}${context ? ` (Context: ${context})` : ''}:

"${quote}"`
          }
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const cleanedQuote = data.choices[0].message.content.trim();

    console.log('Quote cleaned successfully');

    return new Response(JSON.stringify({ cleanedQuote }), {
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
