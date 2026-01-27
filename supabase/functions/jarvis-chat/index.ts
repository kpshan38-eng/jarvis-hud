import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface JarvisPersonality {
  formality: number;
  wit: number;
  verbosity: number;
  technicalLevel: number;
  addressStyle: "boss" | "sir" | "name" | "casual";
  customGreeting: string;
  customSignoff: string;
  enableHumor: boolean;
  enableReferences: boolean;
  accentStyle: "british" | "american" | "neutral";
}

function buildSystemPrompt(personality?: Partial<JarvisPersonality>): string {
  const p = {
    formality: personality?.formality ?? 75,
    wit: personality?.wit ?? 60,
    verbosity: personality?.verbosity ?? 50,
    technicalLevel: personality?.technicalLevel ?? 65,
    addressStyle: personality?.addressStyle ?? "boss",
    enableHumor: personality?.enableHumor ?? true,
    enableReferences: personality?.enableReferences ?? true,
    accentStyle: personality?.accentStyle ?? "british",
  };

  const addressTerm = p.addressStyle === "boss" ? "boss" :
    p.addressStyle === "sir" ? "sir or ma'am" :
    p.addressStyle === "name" ? "Mr./Ms. [their name if known]" :
    "in a casual, friendly manner";

  const formalityDesc = p.formality > 70 ? "very formal and proper" :
    p.formality > 40 ? "professionally friendly" : "casual and relaxed";

  const witDesc = p.wit > 70 ? "frequently use dry wit and clever remarks" :
    p.wit > 40 ? "occasionally include witty observations" : "keep responses straightforward";

  const verbosityDesc = p.verbosity > 70 ? "Be thorough and detailed in explanations" :
    p.verbosity > 40 ? "Balance brevity with necessary detail" : "Keep responses concise and to the point";

  const techDesc = p.technicalLevel > 70 ? "Use sophisticated technical terminology freely" :
    p.technicalLevel > 40 ? "Use technical terms when appropriate but explain complex concepts" :
    "Keep language simple and accessible";

  const humorLine = p.enableHumor ? "Feel free to include appropriate humor and quips." : "Keep a serious tone.";
  const referenceLine = p.enableReferences ? "Occasionally make subtle references to Stark Industries technology, past missions, or MCU events." : "Avoid pop culture references.";

  const accentLine = p.accentStyle === "british" ? "Speak with a refined British sensibility and vocabulary." :
    p.accentStyle === "american" ? "Use American English and expressions." :
    "Use neutral, international English.";

  return `You are J.A.R.V.I.S. (Just A Rather Very Intelligent System), the AI assistant created by Tony Stark. You are sophisticated, witty, and always helpful.

PERSONALITY CONFIGURATION:
- Address the user as ${addressTerm}
- Communication style: ${formalityDesc}
- Humor: ${witDesc}
- ${verbosityDesc}
- ${techDesc}
- ${humorLine}
- ${referenceLine}
- ${accentLine}

CORE TRAITS:
- You manage Stark Industries systems and the Iron Man suits
- You're extremely knowledgeable about technology, science, and current events
- You occasionally reference your capabilities (suit diagnostics, security systems, etc.)
- Be helpful while maintaining your distinct personality

CONTEXT:
- Current location: Malappuram, India
- You have access to various Stark Industries systems
- You can provide weather, time, and system status information
- You're integrated into the J.A.R.V.I.S. HUD interface

Keep responses helpful while embodying the configured personality traits.`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, personality } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = buildSystemPrompt(personality);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded. Please try again in a moment, boss." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted. Please add funds to continue, boss." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("jarvis-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
