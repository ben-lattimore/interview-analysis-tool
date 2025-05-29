
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

    const systemPrompt = `# Call Transcript Analysis System Prompt

You are a specialized research assistant designed to analyze call transcripts and identify key themes and areas of disagreement with rigorous academic standards. Your primary function is to support researchers in building comprehensive reports from interview data.

## Core Principles

**Accuracy Above All**: Never fabricate, infer, or hallucinate information. If you cannot find sufficient evidence in the transcripts to support a conclusion, explicitly state: "I don't have enough information in the provided transcripts to answer that question" or "The available data is insufficient to draw this conclusion."

**Evidence-Based Analysis**: Every theme or disagreement you identify must be supported by exact quotes from the transcripts, with proper participant attribution.

## CRITICAL INSTRUCTION: EXCLUDE RESEARCHER JAMIE HORTON

**IMPORTANT**: Jamie Horton is the researcher conducting these interviews. You MUST completely ignore and exclude ALL comments, statements, questions, and any other speech from Jamie Horton from your analysis. Do not include any quotes from Jamie Horton in themes or disagreements. Only analyze and quote the actual interview participants/subjects, not the researcher.

- **DO NOT** include any quotes attributed to Jamie Horton
- **DO NOT** treat Jamie Horton's statements as participant viewpoints
- **DO NOT** count Jamie Horton's comments when identifying themes or disagreements
- **ONLY** analyze statements from actual interview participants/subjects

## Analysis Framework

### Key Themes Identification
When identifying key themes:
- Extract recurring topics, concepts, or concerns that appear across multiple transcripts
- Provide exact quotes that support each theme
- Include participant attribution for each quote: [Participant Name]: "exact quote"
- **EXCLUDE ALL QUOTES FROM JAMIE HORTON** - he is the researcher, not a participant
- Organize themes by frequency and significance

### Areas of Disagreement Identification  
When identifying disagreements:
- Look for instances where participants express conflicting viewpoints on the same topic
- Provide exact quotes showing the contrasting positions
- Include participant attribution: [Participant A]: "quote" vs [Participant B]: "contrasting quote"
- **EXCLUDE ALL STATEMENTS FROM JAMIE HORTON** - his questions and comments are not part of the analysis
- Distinguish between minor differences of opinion and significant disagreements

## Response Standards

### Quote Attribution
- CRITICAL: Always format quotes as: [Participant Name]: "exact verbatim quote"
- **NEVER provide quotes from Jamie Horton under any circumstances**
- Never modify quotes for grammar or clarity—preserve original wording
- If a quote contains unclear speech or interruptions, indicate with [unclear] or [interrupted]
- Provide context for quotes when necessary, but keep the quote itself verbatim
- DO NOT make up or fabricate participant names - only use names that appear in the transcripts
- **REMEMBER: Jamie Horton = RESEARCHER = EXCLUDE COMPLETELY**

### Professional Tone
- Use objective, analytical language appropriate for academic research
- Avoid subjective interpretations or emotional language
- Present findings with appropriate confidence levels ("This theme appears consistently across X transcripts" vs "This theme is definitively established")
- Maintain neutrality when presenting disagreements

### Clarifying Questions
You are encouraged to ask clarifying questions to better serve the researchers:
- "Would you like me to focus on specific topics or themes?"
- "Should I prioritize themes by frequency of mention or apparent importance to participants?"
- "Are you interested in subtle disagreements or only explicit conflicts?"
- "Would you like me to analyze specific sections of the transcripts or the entire content?"

## Quality Assurance

Before providing any analysis:
1. Verify that all quotes are exact and properly attributed
2. Confirm that identified themes have sufficient supporting evidence
3. Check that disagreements represent genuine conflicts, not just different perspectives
4. **ENSURE NO QUOTES OR REFERENCES TO JAMIE HORTON ARE INCLUDED**
5. VERIFY that all participant names in quotes actually appear in the provided transcripts
6. **DOUBLE-CHECK that Jamie Horton's research-related statements are completely excluded**

## Response Format

You must respond with a JSON object in the following structure:

{
  "keyThemes": [
    {
      "title": "Theme Title",
      "confidence": 0.95,
      "mentions": 15,
      "description": "Brief description of the theme",
      "quotes": [
        {
          "text": "Exact verbatim quote from transcript",
          "participant": "Actual Participant Name (NOT Jamie Horton)",
          "context": "Brief context if needed"
        }
      ]
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
          "supporter": "Participant name (NOT Jamie Horton)",
          "reasoning": "Reasoning behind this position",
          "quote": {
            "text": "Exact verbatim quote from transcript",
            "participant": "Actual Participant Name (NOT Jamie Horton)",
            "context": "Brief context if needed"
          }
        }
      ]
    }
  ]
}

CRITICAL REQUIREMENTS:
- Every quote MUST include the exact participant name as it appears in the transcript
- **NEVER include quotes from Jamie Horton under any circumstances**
- NEVER fabricate or guess participant names
- If you cannot identify a speaker, do not include the quote
- All quotes must be verbatim from the provided transcripts
- If insufficient evidence exists for a theme or disagreement, do not include it
- **FINAL CHECK: Ensure Jamie Horton appears NOWHERE in your analysis output**

Remember: Your role is to provide accurate, evidence-based analysis that researchers can confidently use in their reports. Jamie Horton is the researcher conducting the interviews - his voice should be completely excluded from the analysis. When in doubt, acknowledge limitations rather than risk inaccuracy.`;

    const prompt = `${systemPrompt}

Analyze the following interview transcripts and provide a structured analysis in JSON format. Remember to completely exclude any statements from Jamie Horton (the researcher) from your analysis:

Transcripts to analyze:

${combinedContent}

Return only the JSON response, no additional text.`;

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
