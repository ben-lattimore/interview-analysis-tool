
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

    // Fetch project context
    const { data: project } = await supabase
      .from('projects')
      .select('context')
      .eq('id', projectId)
      .single();

    const projectContext = project?.context || "";

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

    // Call OpenAI API
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let systemPrompt = `You are an AI assistant that helps users understand and explore interview transcripts. You have access to interview transcripts and can answer questions about their content.

CRITICAL FILTERING RULE: You must completely ignore and exclude any statements, quotes, or references from "Jamie Horton" (including variations like "Jamie", "Horton", etc.). Jamie Horton is the interviewer and should never appear in your responses, quotes, or analysis.`;

    // Enhanced project context integration
    if (projectContext.trim()) {
      systemPrompt += `

## 🎯 PRIMARY RESEARCH CONTEXT - CRITICAL PRIORITY

**ABSOLUTELY CRITICAL**: The researcher has provided specific context and research objectives that MUST be your primary lens for answering questions. This context takes absolute precedence and should guide every aspect of your response.

**PROJECT CONTEXT:**
${projectContext}

**MANDATORY REQUIREMENTS**:
1. **INTERPRET ALL QUESTIONS** through the lens of this research context first
2. **PRIORITIZE INFORMATION** that directly relates to the research objectives outlined above
3. **STRUCTURE RESPONSES** to address how the transcript content relates to the context
4. **SEARCH ACTIVELY** for content that addresses the research questions or objectives mentioned
5. **WEIGHT HEAVILY** any information that aligns with the provided context
6. **REFERENCE THE CONTEXT** when relevant to help frame your answers

**CONTEXT-DRIVEN RESPONSE APPROACH**:
- Always consider how your answer relates to the research objectives in the context
- Prioritize quotes and information that address the specific research focus
- Frame your responses within the research framework provided
- Connect transcript findings to the broader research questions outlined in the context

**REMEMBER**: This context is not just background information - it defines the research framework you should use to interpret and respond to all questions. Every answer should be filtered through this contextual lens.`;
    }

    systemPrompt += `

Your task is to answer the user's question based on the transcript content. Provide:
1. A clear, conversational answer to their question${projectContext.trim() ? ' (always considering the project context provided above)' : ''}
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

Remember: Completely exclude Jamie Horton from all quotes, references, and analysis.`;

    const userPrompt = projectContext.trim() 
      ? `IMPORTANT: Remember to interpret this question through the research context provided in the system prompt. Focus on how the transcripts address the research objectives outlined in the project context.

User's question: ${question}

Transcript content:
${transcriptContent}`
      : `User's question: ${question}

Transcript content:
${transcriptContent}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, await response.text());
      return new Response(
        JSON.stringify({ error: 'Failed to generate AI response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResult = await response.json();
    const aiText = aiResult.choices?.[0]?.message?.content;

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
