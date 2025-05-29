
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transcripts } = await req.json();
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not found');
    }

    if (!transcripts || !Array.isArray(transcripts) || transcripts.length === 0) {
      throw new Error('No transcripts provided');
    }

    // Combine all transcript content
    const combinedContent = transcripts.map((t: any) => 
      `=== ${t.filename} ===\n${t.content || 'No content available'}`
    ).join('\n\n');

    const prompt = `
You are an expert analyst specialized in identifying key themes and disagreements in interview transcripts. 

Analyze the following interview transcripts and provide a structured analysis in JSON format with the following structure:

{
  "keyThemes": [
    {
      "title": "Theme Title",
      "confidence": 0.95,
      "mentions": 15,
      "description": "Brief description of the theme",
      "quotes": ["Quote 1", "Quote 2"]
    }
  ],
  "disagreements": [
    {
      "title": "Disagreement Topic",
      "intensity": "High|Medium|Low",
      "participants": ["Participant 1", "Participant 2"],
      "description": "Description of the disagreement",
      "positions": [
        {
          "stance": "Position description",
          "supporter": "Participant name",
          "reasoning": "Reasoning behind this position"
        }
      ]
    }
  ]
}

Guidelines:
- Identify 3-6 key themes with confidence scores (0-1)
- Look for areas where participants disagree or have different viewpoints
- Extract meaningful quotes that support each theme
- Classify disagreement intensity as High, Medium, or Low
- Be specific about who holds which positions in disagreements
- Focus on substantive content, not superficial disagreements

Transcripts to analyze:

${combinedContent}

Return only the JSON response, no additional text.
`;

    console.log('Sending request to Gemini API...');

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4096,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('Gemini response received');

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response from Gemini API');
    }

    const analysisText = data.candidates[0].content.parts[0].text;
    
    // Try to parse the JSON response
    let analysis;
    try {
      // Clean up the response text to extract JSON
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse JSON:', analysisText);
      throw new Error('Failed to parse AI response as JSON');
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-transcripts function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
