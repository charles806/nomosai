import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Keys are read from Supabase Edge Function secrets (set with `supabase secrets set`).
// They never touch the client bundle or Vercel env — that's the whole point of this function.
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || '';
const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY') || '';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
// Change to whichever OpenRouter model you want as the fallback. This one
// is vision-capable, so unlike a text-only fallback, attached images still
// work here instead of silently being dropped.
const OPENROUTER_MODEL = 'anthropic/claude-sonnet-4.5';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';

interface GeminiPart {
  text?: string;
  inline_data?: { mime_type: string; data: string };
}

interface GatewayRequestBody {
  systemPrompt: string;
  parts: GeminiPart[];
}

async function callGemini(systemPrompt: string, parts: GeminiPart[]): Promise<string> {
  if (!GEMINI_API_KEY) throw new Error('Gemini key not configured');

  const requestBody = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: 'user', parts }],
    generationConfig: {
      temperature: 0.0,
      maxOutputTokens: 8192,
      topP: 0.1,
      topK: 40,
    },
  };

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || `Gemini API error (${response.status})`);
  }

  const text = data.candidates?.[0]?.content?.parts?.find((p: any) => p.text)?.text;
  if (!text) throw new Error('Gemini returned an empty response');

  return text;
}

async function callOpenRouter(systemPrompt: string, parts: GeminiPart[]): Promise<string> {
  if (!OPENROUTER_API_KEY) throw new Error('OpenRouter key not configured');

  // Unlike a text-only fallback, we keep images intact here — OpenRouter's
  // vision-capable models accept them as standard OpenAI-style image_url
  // content blocks with a base64 data URI.
  const content: Record<string, unknown>[] = parts
    .map((p) => {
      if (p.text) return { type: 'text', text: p.text };
      if (p.inline_data) {
        return {
          type: 'image_url',
          image_url: { url: `data:${p.inline_data.mime_type};base64,${p.inline_data.data}` },
        };
      }
      return null;
    })
    .filter((block): block is Record<string, unknown> => block !== null);

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      // OpenRouter's own docs require these for attribution/rankings —
      // omitting them can affect routing/rate limits on their side.
      'HTTP-Referer': 'https://greenai-sand.vercel.app',
      'X-Title': 'GREEN AI',
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      temperature: 0.0,
      max_tokens: 2048,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content },
      ],
    }),
  });

  // Read as text first and parse defensively — a gateway returning an "ok"
  // status with a non-JSON body (e.g. an HTML error page) should surface a
  // clear error instead of throwing an unhandled parse exception.
  const rawText = await response.text();
  let data: any;
  try {
    data = JSON.parse(rawText);
  } catch {
    throw new Error(`OpenRouter returned a non-JSON response (status ${response.status}): ${rawText.slice(0, 200)}`);
  }

  if (!response.ok) {
    throw new Error(data?.error?.message || `OpenRouter API error (${response.status})`);
  }

  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('OpenRouter returned an empty response');

  return text;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Require a logged-in Supabase user — this endpoint holds paid API keys,
  // so it should never be reachable anonymously.
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Missing authorization' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const jwt = authHeader.replace('Bearer ', '');
  const authClient = createClient(supabaseUrl, supabaseAnonKey);
  const { data: userData, error: userError } = await authClient.auth.getUser(jwt);

  if (userError || !userData?.user) {
    return new Response(JSON.stringify({ error: 'Invalid or expired session' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let body: GatewayRequestBody;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { systemPrompt, parts } = body;

  if (!systemPrompt || !Array.isArray(parts) || parts.length === 0) {
    return new Response(JSON.stringify({ error: 'Missing systemPrompt or parts' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Primary: Gemini. Fallback: OpenRouter. Any Gemini failure (quota, outage, bad key) triggers fallback.
  try {
    const text = await callGemini(systemPrompt, parts);
    return new Response(JSON.stringify({ text, provider: 'gemini' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (geminiError: any) {
    console.error('[ai-gateway] Gemini failed, falling back to OpenRouter:', geminiError.message);

    try {
      const text = await callOpenRouter(systemPrompt, parts);
      return new Response(JSON.stringify({ text, provider: 'openrouter' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (openRouterError: any) {
      console.error('[ai-gateway] OpenRouter fallback also failed:', openRouterError.message);
      return new Response(
        JSON.stringify({ error: 'Both AI providers are currently unavailable. Please try again shortly.' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }
});
