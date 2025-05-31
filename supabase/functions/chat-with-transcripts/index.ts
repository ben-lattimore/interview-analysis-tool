
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, projectId } = await req.json();
    
    if (!question || !projectId) {
      return new Response(
        JSON.stringify({ error: 'Question and project ID are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all transcripts for this project
    const { data: transcripts, error: transcriptsError } = await supabase
      .from('transcripts')
      .select('filename, content')
      .eq('project_id', projectId);

    if (transcriptsError) {
      console.error('Error fetching transcripts:', transcriptsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch transcripts' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!transcripts || transcripts.length === 0) {
      return new Response(
        JSON.stringify({ 
          response: "No transcripts found for this project. Please add some transcripts first.",
          quotes: []
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare transcript content for AI
    const transcriptContent = transcripts.map(t => 
      `=== ${t.filename} ===\n${t.content}`
    ).join('\n\n');

    // Call Gemini API
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({ error: 'Gemini API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const prompt = `You are an AI assistant that helps users understand and explore interview transcripts. You have access to interview transcripts and can answer questions about their content.

CRITICAL FILTERING RULE: You must completely ignore and exclude any statements, quotes, or references from "Jamie Horton" (including variations like "Jamie", "Horton", etc.). Jamie Horton is the interviewer and should never appear in your responses, quotes, or analysis.

Your task is to answer the user's question based on the transcript content. Provide:
1. A clear, conversational answer to their question
2. Relevant quotes from the transcripts to support your answer (exclude Jamie Horton completely)
3. Context about which participants said what

Format your response as JSON with this structure:
{
  "response": "Your conversational answer here",
  "quotes": [
    {
      "text": "The actual quote",
      "participant": "Participant name",
      "context": "Brief context about when/why this was said"
    }
  ]
}

User's question: ${question}

Transcript content:
${transcriptContent}

Remember: Completely exclude Jamie Horton from all quotes, references, and analysis.`;

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
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      }),
    });

    if (!response.ok) {
      console.error('Gemini API error:', response.status, await response.text());
      return new Response(
        JSON.stringify({ error: 'Failed to generate AI response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResult = await response.json();
    const aiText = aiResult.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiText) {
      return new Response(
        JSON.stringify({ error: 'No response generated from AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse AI response
    let parsedResponse;
    try {
      // Extract JSON from AI response (sometimes it includes markdown formatting)
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback if no JSON structure
        parsedResponse = {
          response: aiText,
          quotes: []
        };
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      parsedResponse = {
        response: aiText,
        quotes: []
      };
    }

    // Additional filtering to remove any Jamie Horton references that might have slipped through
    if (parsedResponse.quotes) {
      parsedResponse.quotes = parsedResponse.quotes.filter(quote => 
        !quote.participant?.toLowerCase().includes('jamie') &&
        !quote.participant?.toLowerCase().includes('horton') &&
        !quote.text?.toLowerCase().includes('jamie horton')
      );
    }

    // Save the conversation to database
    const { error: saveError } = await supabase
      .from('chat_conversations')
      .insert({
        project_id: projectId,
        user_message: question,
        ai_response: parsedResponse.response,
        response_quotes: parsedResponse.quotes || []
      });

    if (saveError) {
      console.error('Error saving conversation:', saveError);
      // Don't fail the request if saving fails, just log it
    }

    return new Response(
      JSON.stringify(parsedResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in chat-with-transcripts function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
