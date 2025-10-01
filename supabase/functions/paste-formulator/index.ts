import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pasteType, category, mode, knownIngredients, constraints, targets } = await req.json();
    
    console.log('Formulation request:', { pasteType, category, mode, targets });

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Build scientific prompt
    const systemPrompt = `You are a world-class food scientist specializing in Indian dairy science, paste formulation, and gelato technology. You have deep expertise in:
- MEC3, Pregel, and Babbi formulation standards
- Indian dairy composition (A2, buffalo milk)
- Water activity and preservation science
- Gelato base compatibility and integration
- Modern emulsification and stabilization techniques

CRITICAL RULES:
1. Every ingredient must have a scientific function and citation
2. All process parameters (temp, time) must be scientifically justified
3. Reference peer-reviewed literature and industry white papers
4. Calculate precise fat%, MSNF%, sugar%, and water activity
5. Ensure gelato compatibility (no phase separation, proper dispersion)
6. For Indian sweets, reference traditional composition data

OUTPUT FORMAT: Return ONLY valid JSON matching this exact structure:
{
  "paste_name": "string",
  "yield_kg": number,
  "category": "dairy|fruit|confection|spice|nut|mixed",
  "ingredients": [
    {
      "name": "string",
      "grams": number,
      "percentage": number,
      "function": "string",
      "alternative": "string (optional)",
      "reference": "ref-id"
    }
  ],
  "composition": {
    "fat_pct": number,
    "msnf_pct": number,
    "sugars_pct": number,
    "water_pct": number,
    "water_activity": number
  },
  "process": [
    {
      "step": number,
      "action": "string",
      "temperature": number (optional),
      "time": number (optional),
      "critical_control": "string (optional)",
      "rationale": "string",
      "references": ["ref-id"]
    }
  ],
  "preservation_method": "retort|hot_fill|frozen|freeze_dry",
  "gelato_dosage": {
    "min_pct": number,
    "max_pct": number,
    "recommended_pct": number
  },
  "sensory_prediction": {
    "mouthfeel": "string",
    "flavor_profile": "string",
    "color": "string",
    "shelf_life": "string"
  },
  "references": [
    {
      "id": "ref-1",
      "source": "MEC3 (2023)",
      "title": "Pistachio Paste Technical Sheet",
      "relevance": "Nut paste fat ratios and grinding parameters"
    }
  ],
  "ai_confidence": number,
  "novel_pairing": {
    "discovered": boolean,
    "ingredients": ["string"],
    "rationale": "string"
  }
}`;

    let userPrompt = '';
    
    if (mode === 'ai_discovery') {
      userPrompt = `Using ML-powered flavor pairing and Indian ingredient databases, suggest a novel ${category} paste formulation for gelato.

Requirements:
- Must be scientifically sound and feasible
- Should complement existing Indian sweet market
- Target water activity < 0.85 for shelf stability
- Optimized for 8-12% inclusion in gelato base
- Include at least one unexpected but validated pairing

Base the discovery on:
1. Flavor compound analysis from Food Chemistry (2021)
2. Neural net food pairing models (Frontiers in AI, 2024)
3. Traditional Indian ingredient combinations
4. MEC3/Pregel/Babbi benchmarking data

Provide full scientific recipe with citations.`;
    } else if (mode === 'reverse_engineer') {
      userPrompt = `REVERSE ENGINEERING MODE: Given these target parameters, propose 2-3 candidate paste formulations.

TARGETS:
${targets?.sp ? `- Sweetness Power (SP): ${targets.sp}` : ''}
${targets?.afp ? `- Anti-Freezing Power (AFP): ${targets.afp}` : ''}
${targets?.total_solids ? `- Total Solids: ${targets.total_solids}%` : ''}
${targets?.fat_pct ? `- Fat: ${targets.fat_pct}%` : ''}
${targets?.viscosity ? `- Texture: ${targets.viscosity}` : ''}

ALLOWED INGREDIENTS: ${knownIngredients || 'Any food-grade ingredients'}
${constraints ? `CONSTRAINTS: ${constraints}` : ''}

Provide 2-3 formulations ranked by:
1. "Closest Fit" - mathematically closest to targets
2. "Lower Cost" - economical alternative with acceptable deltas
3. "Clean Label" - minimal ingredients, consumer-friendly

For each formulation:
- Complete ingredient list with grams and percentages
- Calculated SP, AFP, composition values
- Delta analysis vs targets (±0.5 acceptable)
- Process steps (kadai-friendly, no lab equipment)
- Cost estimate if possible

Use industry ingredients (MEC3, Pregel standards) and cite all claims.`;
    } else {
      userPrompt = `Formulate a scientific recipe for ${pasteType} paste (${category} category) for gelato infusion.

${knownIngredients ? `Known/preferred ingredients: ${knownIngredients}` : ''}
${constraints ? `Constraints: ${constraints}` : ''}
${targets?.viscosity ? `Target texture: ${targets.viscosity}` : ''}

Requirements:
- Industry-standard composition (reference MEC3/Pregel/Babbi)
- Target fat: ${category === 'nut' ? '35-55%' : category === 'dairy' ? '25-40%' : '0-10%'}
- Target MSNF: ${category === 'dairy' ? '12-18%' : '5-10%'}
- Water activity < 0.85
- Particle size < 30 microns for nuts
- pH ${category === 'fruit' ? '< 4.6' : '> 4.6'}
- Optimized for 8-12% gelato inclusion
- Full process with temperatures and times (kadai-friendly, no specialized lab equipment)
- All claims cited with references

${targets?.viscosity === 'spreadable' ? '- Nutella-like spreadability: 50-60 viscosity index, use glucose/dextrose to prevent crystallization' : ''}

Provide complete scientific formulation with step-by-step process and full reference list.`;
    }

    console.log('Calling Lovable AI...');
    
    // ENHANCED: Add timeout and retry logic
    const AI_TIMEOUT_MS = 45000; // 45 seconds
    const MAX_RETRIES = 2;
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`AI attempt ${attempt}/${MAX_RETRIES}...`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);
        
        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.7,
          }),
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);

        // Handle rate limiting
        if (aiResponse.status === 429) {
          console.warn('Rate limited, waiting before retry...');
          await new Promise(resolve => setTimeout(resolve, 2000 * attempt)); // Exponential backoff
          continue;
        }

        // Handle payment required
        if (aiResponse.status === 402) {
          console.error('Payment required - out of AI credits');
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'AI credits exhausted. Please add credits to your Lovable workspace.',
              errorType: 'payment_required'
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 402 
            }
          );
        }

        if (!aiResponse.ok) {
          const errorText = await aiResponse.text();
          console.error('AI API error:', aiResponse.status, errorText);
          throw new Error(`AI API error: ${aiResponse.status} - ${errorText}`);
        }
        
        // Success! Break retry loop
        lastError = null;

        const aiData = await aiResponse.json();
        console.log('AI response received successfully');
        
        const content = aiData.choices[0].message.content;
        
        // Extract JSON from markdown code blocks if present
        let jsonContent = content;
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          jsonContent = jsonMatch[1];
        }
        
        // ENHANCED: Validate JSON before parsing
        let recipe;
        try {
          recipe = JSON.parse(jsonContent);
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          throw new Error(`Failed to parse AI response as JSON: ${parseError.message}`);
        }
        
        // ENHANCED: Validate recipe structure
        if (!recipe.paste_name || !recipe.ingredients || !recipe.composition) {
          console.error('Invalid recipe structure:', recipe);
          throw new Error('AI returned incomplete recipe structure');
        }
        
        return new Response(
          JSON.stringify({ success: true, recipe }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
        
      } catch (error) {
        lastError = error;
        
        // If it's a timeout, retry
        if (error.name === 'AbortError') {
          console.warn(`Timeout on attempt ${attempt}, retrying...`);
          if (attempt < MAX_RETRIES) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            continue;
          }
        }
        
        // If it's not the last attempt, retry
        if (attempt < MAX_RETRIES) {
          console.warn(`Error on attempt ${attempt}, retrying...`, error.message);
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          continue;
        }
        
        // Last attempt failed, throw
        throw error;
      }
    }
    
    // All retries exhausted
    throw lastError || new Error('All AI retry attempts failed');

  } catch (error) {
    console.error('Error in paste-formulator:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
