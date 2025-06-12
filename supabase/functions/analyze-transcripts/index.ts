
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

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
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY not found');
    }

    if (!transcripts || !Array.isArray(transcripts) || transcripts.length === 0) {
      throw new Error('No transcripts provided');
    }

    // Initialize Supabase client to get project context
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the project ID from the first transcript
    const projectId = transcripts[0]?.project_id;
    let projectContext = "";

    if (projectId) {
      const { data: project } = await supabase
        .from('projects')
        .select('context')
        .eq('id', projectId)
        .single();
      
      projectContext = project?.context || "";
    }

    // Combine all transcript content
    const combinedContent = transcripts.map((t: any) => 
      `=== ${t.filename} ===\n${t.content || 'No content available'}`
    ).join('\n\n');

    let systemPrompt = `# Call Transcript Analysis System Prompt

You are a specialized research assistant designed to analyze call transcripts and identify key themes and areas of disagreement with rigorous academic standards. Your primary function is to support researchers in building comprehensive reports from interview data.

## Core Principles

**Accuracy Above All**: Never fabricate, infer, or hallucate information. If you cannot find sufficient evidence in the transcripts to support a conclusion, explicitly state: "I don't have enough information in the provided transcripts to answer that question" or "The available data is insufficient to draw this conclusion."

**Evidence-Based Analysis**: Every theme or disagreement you identify must be supported by exact quotes from the transcripts, with proper participant attribution.

## CRITICAL INSTRUCTION: ABSOLUTELY EXCLUDE JAMIE HORTON

**JAMIE HORTON IS THE RESEARCHER/INTERVIEWER - NOT A PARTICIPANT**

Jamie Horton is conducting these interviews as a researcher. You MUST:

❌ **NEVER INCLUDE ANY QUOTES FROM JAMIE HORTON UNDER ANY CIRCUMSTANCES**
❌ **NEVER TREAT JAMIE HORTON AS A PARTICIPANT OR INTERVIEW SUBJECT**  
❌ **NEVER COUNT JAMIE HORTON'S STATEMENTS IN YOUR ANALYSIS**
❌ **NEVER ATTRIBUTE ANY VIEWPOINTS TO JAMIE HORTON**
❌ **NEVER USE JAMIE HORTON'S WORDS AS SUPPORTING EVIDENCE**
❌ **IGNORE ALL QUESTIONS, COMMENTS, AND STATEMENTS FROM JAMIE HORTON**

✅ **ONLY ANALYZE STATEMENTS FROM ACTUAL INTERVIEW PARTICIPANTS/SUBJECTS**
✅ **TREAT JAMIE HORTON AS COMPLETELY INVISIBLE IN YOUR ANALYSIS**
✅ **SKIP OVER ALL CONTENT ATTRIBUTED TO JAMIE HORTON**

**JAMIE HORTON EXCLUSION RULE**: If you see "Jamie Horton:" followed by any text, completely ignore that text. Do not include it in themes, disagreements, or quotes under any circumstances. This is non-negotiable.

**MULTIPLE NAME VARIATIONS**: Jamie Horton might appear as:
- Jamie Horton
- Jamie
- Horton
- J. Horton
- Dr. Horton
- Professor Horton
- Interviewer
- Researcher

ALL variations must be completely excluded from analysis.`;

    // Enhanced project context integration
    if (projectContext.trim()) {
      systemPrompt += `

## 🎯 PRIMARY RESEARCH FOCUS - PROJECT CONTEXT

**CRITICAL PRIORITY**: The researcher has provided specific context and research objectives that MUST be your primary analytical lens. This context takes absolute precedence and should guide every aspect of your analysis.

**PROJECT CONTEXT:**
${projectContext}

**MANDATORY REQUIREMENTS**:
1. **PRIORITIZE THEMES** that directly relate to the context above - these should be your first and most prominent findings
2. **SEARCH ACTIVELY** for content that addresses the research questions or objectives mentioned in the context
3. **WEIGHT HEAVILY** any themes that align with the provided context when determining confidence scores and mentions
4. **STRUCTURE YOUR ANALYSIS** around the research focus areas outlined in the context
5. **CROSS-REFERENCE** every theme against the context to ensure alignment with research objectives
6. **ELEVATE** context-related themes even if they appear less frequently than other topics

**CONTEXT-DRIVEN ANALYSIS APPROACH**:
- Start your analysis by identifying how the transcripts address the specific research questions in the context
- Themes that align with the context should receive higher confidence scores
- Disagreements related to context topics should be prioritized
- Use the context as your analytical framework throughout the entire process

**REMEMBER**: The project context is not just background information - it is your primary analytical directive. Every theme and disagreement should be evaluated through this contextual lens first.`;
    }

    systemPrompt += `

## Analysis Framework

### Key Themes Identification
When identifying key themes:
- **FIRST**: Look for themes directly related to the project context (if provided)
- Extract recurring topics, concepts, or concerns that appear across multiple transcripts
- Provide exact quotes that support each theme
- Include participant attribution for each quote: [Participant Name]: "exact quote"
- **COMPLETELY EXCLUDE ALL QUOTES FROM JAMIE HORTON OR ANY INTERVIEWER**
- Organize themes by relevance to project context, then by frequency and significance
- **PRIORITIZE themes that align with the project context if provided**

### Areas of Disagreement Identification  
When identifying disagreements:
- **FIRST**: Look for disagreements on topics mentioned in the project context
- Look for instances where participants express conflicting viewpoints on the same topic
- Provide exact quotes showing the contrasting positions
- Include participant attribution: [Participant A]: "quote" vs [Participant B]: "contrasting quote"
- **COMPLETELY EXCLUDE ALL STATEMENTS FROM JAMIE HORTON OR ANY INTERVIEWER**
- Distinguish between minor differences of opinion and significant disagreements

## Response Standards

### Quote Attribution
- CRITICAL: Always format quotes as: [Participant Name]: "exact verbatim quote"
- **NEVER provide quotes from Jamie Horton, interviewer, or researcher under any circumstances**
- Never modify quotes for grammar or clarity—preserve original wording
- If a quote contains unclear speech or interruptions, indicate with [unclear] or [interrupted]
- Provide context for quotes when necessary, but keep the quote itself verbatim
- DO NOT make up or fabricate participant names - only use names that appear in the transcripts
- **ABSOLUTE RULE: Jamie Horton = RESEARCHER = EXCLUDE COMPLETELY FROM ALL ANALYSIS**

### Professional Tone
- Use objective, analytical language appropriate for academic research
- Avoid subjective interpretations or emotional language
- Present findings with appropriate confidence levels ("This theme appears consistently across X transcripts" vs "This theme is definitively established")
- Maintain neutrality when presenting disagreements

## Quality Assurance

Before providing any analysis:
1. Verify that all quotes are exact and properly attributed
2. Confirm that identified themes have sufficient supporting evidence
3. Check that disagreements represent genuine conflicts, not just different perspectives
4. **CRITICAL CHECK: ENSURE NO QUOTES OR REFERENCES TO JAMIE HORTON ARE INCLUDED ANYWHERE**
5. VERIFY that all participant names in quotes actually appear in the provided transcripts
6. **DOUBLE-CHECK that Jamie Horton's research-related statements are completely excluded**
7. **TRIPLE-CHECK: Scan your entire response and remove any mention of Jamie Horton**
8. **FINAL VERIFICATION: Search for "Jamie", "Horton", "interviewer", "researcher" and ensure none appear in your analysis**

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
          "participant": "Actual Participant Name (NEVER Jamie Horton or any interviewer)",
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
          "supporter": "Participant name (NEVER Jamie Horton or any interviewer)",
          "reasoning": "Reasoning behind this position",
          "quote": {
            "text": "Exact verbatim quote from transcript",
            "participant": "Actual Participant Name (NEVER Jamie Horton or any interviewer)",
            "context": "Brief context if needed"
          }
        }
      ]
    }
  ]
}

## MANDATORY PRE-SUBMISSION CHECKLIST:

Before submitting your response, you MUST verify:
□ Search your entire JSON response for "Jamie Horton" - if found, REMOVE immediately
□ Search your entire JSON response for "Jamie" - if found, verify it's not the interviewer
□ Search your entire JSON response for "Horton" - if found, REMOVE if it refers to Jamie
□ Search your entire JSON response for "interviewer" - if found, REMOVE
□ Search your entire JSON response for "researcher" - if found, REMOVE if referring to person
□ Verify every single quote comes from an actual interview participant, NOT the interviewer
□ Confirm no analysis content refers to the person conducting the interviews

**FINAL RULE**: If you find ANY reference to Jamie Horton in your analysis, you MUST remove that entire theme, disagreement, or quote. Jamie Horton is the researcher and must be completely invisible in your analysis output.

Remember: Your role is to provide accurate, evidence-based analysis that researchers can confidently use in their reports. Jamie Horton is the researcher conducting the interviews - his voice should be completely excluded from the analysis. When in doubt, acknowledge limitations rather than risk inaccuracy.`;

    let contextualPrompt = `Analyze the following interview transcripts and provide a structured analysis in JSON format.

**CRITICAL REMINDER**: Jamie Horton is the interviewer/researcher. Do NOT include any of his quotes, statements, or perspectives in your analysis. Completely ignore everything Jamie Horton says. Only analyze the actual interview participants/subjects.

**BEFORE YOU START**: Scan through the transcripts and identify who Jamie Horton is (usually the interviewer asking questions). Then completely ignore all of his contributions to the conversation.`;

    // Enhanced context emphasis in the main prompt
    if (projectContext.trim()) {
      contextualPrompt += `

**🎯 PRIMARY ANALYTICAL DIRECTIVE - PROJECT CONTEXT**:

You MUST use the following project context as your primary analytical framework. This is not optional background information - this IS your research directive:

${projectContext}

**ANALYSIS REQUIREMENTS**:
1. **START** your analysis by looking for themes directly related to this context
2. **PRIORITIZE** themes and disagreements that address the research objectives outlined above
3. **WEIGHT** context-related findings more heavily in confidence scores and prominence
4. **STRUCTURE** your response to address the specific research questions or focus areas mentioned
5. **ENSURE** that your top themes directly relate to the context provided

Remember: The context above defines what the researcher most wants to understand from these transcripts. Your analysis should primarily serve these research objectives.`;
    }

    contextualPrompt += `

**Transcripts to analyze:**

${combinedContent}

**FINAL INSTRUCTIONS**: 
1. Before submitting your response, search your entire output for "Jamie Horton", "Jamie", or "Horton" and remove any references
2. Ensure your analysis prioritizes themes related to the project context above all else
3. Return only the JSON response with NO mentions of the interviewer

Return only the JSON response, no additional text.`;

    console.log('Sending request to OpenAI API...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: contextualPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenAI response received');

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from OpenAI API');
    }

    const analysisText = data.choices[0].message.content;
    console.log('Raw response from OpenAI:', analysisText.substring(0, 500) + '...');
    
    // Try to parse the JSON response with improved logic
    let analysis;
    try {
      // First, try to parse the response directly
      analysis = JSON.parse(analysisText);
    } catch (directParseError) {
      console.log('Direct parsing failed, trying to extract JSON from markdown...');
      
      // Try to extract JSON from markdown code blocks
      const jsonBlockRegex = /```(?:json)?\s*(\{[\s\S]*?\})\s*```/;
      const jsonMatch = analysisText.match(jsonBlockRegex);
      
      if (jsonMatch && jsonMatch[1]) {
        try {
          analysis = JSON.parse(jsonMatch[1]);
        } catch (markdownParseError) {
          console.error('Failed to parse JSON from markdown block:', markdownParseError);
          throw new Error('Failed to parse JSON from markdown block');
        }
      } else {
        // Try to find JSON object boundaries
        const startIndex = analysisText.indexOf('{');
        const lastIndex = analysisText.lastIndexOf('}');
        
        if (startIndex !== -1 && lastIndex !== -1 && lastIndex > startIndex) {
          const jsonCandidate = analysisText.substring(startIndex, lastIndex + 1);
          try {
            analysis = JSON.parse(jsonCandidate);
          } catch (boundaryParseError) {
            console.error('Failed to parse JSON from boundaries:', boundaryParseError);
            console.error('JSON candidate:', jsonCandidate.substring(0, 500) + '...');
            throw new Error('Failed to parse AI response as JSON');
          }
        } else {
          console.error('No JSON found in response:', analysisText);
          throw new Error('No valid JSON found in AI response');
        }
      }
    }

    // Validate the parsed analysis has required structure
    if (!analysis || typeof analysis !== 'object') {
      throw new Error('Parsed analysis is not a valid object');
    }

    if (!Array.isArray(analysis.keyThemes) || !Array.isArray(analysis.disagreements)) {
      throw new Error('Analysis does not contain required keyThemes and disagreements arrays');
    }

    // AGGRESSIVE filtering to remove ANY Jamie Horton references
    const filterJamieHorton = (item: any) => {
      // List of all possible variations of Jamie Horton's name
      const jamieVariations = [
        'jamie horton', 'jamie', 'horton', 'j. horton', 'dr. horton', 
        'professor horton', 'interviewer', 'researcher', 'dr horton',
        'prof horton', 'j horton'
      ];
      
      const isJamieHorton = (name: string) => {
        if (!name) return false;
        const lowerName = name.toLowerCase().trim();
        return jamieVariations.some(variation => 
          lowerName.includes(variation) || variation.includes(lowerName)
        );
      };

      // Filter quotes
      if (item.quotes) {
        item.quotes = item.quotes.filter((quote: any) => {
          const participantName = quote.participant;
          if (!participantName) return false;
          const isJamie = isJamieHorton(participantName);
          if (isJamie) {
            console.log(`Filtering out quote from Jamie Horton variant: "${participantName}"`);
          }
          return !isJamie;
        });
      }

      // Filter positions
      if (item.positions) {
        item.positions = item.positions.filter((position: any) => {
          const supporterName = position.supporter;
          if (!supporterName) return false;
          
          let isJamieSupporter = isJamieHorton(supporterName);
          let isJamieQuote = false;
          
          if (position.quote && position.quote.participant) {
            isJamieQuote = isJamieHorton(position.quote.participant);
          }
          
          if (isJamieSupporter) {
            console.log(`Filtering out position from Jamie Horton variant supporter: "${supporterName}"`);
          }
          if (isJamieQuote) {
            console.log(`Filtering out position with Jamie Horton variant quote: "${position.quote.participant}"`);
          }
          
          return !isJamieSupporter && !isJamieQuote;
        });
      }

      // Filter participants array
      if (item.participants) {
        item.participants = item.participants.filter((participant: string) => {
          const isJamie = isJamieHorton(participant);
          if (isJamie) {
            console.log(`Filtering out Jamie Horton variant from participants: "${participant}"`);
          }
          return !isJamie;
        });
      }

      return item;
    };

    // Apply filtering
    analysis.keyThemes = analysis.keyThemes.map(filterJamieHorton);
    analysis.disagreements = analysis.disagreements.map(filterJamieHorton);

    // Remove themes or disagreements that have no valid quotes/positions after filtering
    analysis.keyThemes = analysis.keyThemes.filter((theme: any) => 
      theme.quotes && theme.quotes.length > 0
    );
    
    analysis.disagreements = analysis.disagreements.filter((disagreement: any) => 
      disagreement.positions && disagreement.positions.length > 0
    );

    console.log('Successfully filtered analysis with', analysis.keyThemes.length, 'themes and', analysis.disagreements.length, 'disagreements');
    console.log('All Jamie Horton references should now be removed');

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
