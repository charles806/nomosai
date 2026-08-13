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
const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY') || '';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';
// deepseek-chat / deepseek-reasoner were retired July 2026 — use these IDs now.
// V4-Flash is the cheap/fast tier; swap to 'deepseek-v4-pro' for higher quality
// once the free 5M-token grant is used up and cost becomes a factor either way.
const DEEPSEEK_MODEL = 'deepseek-v4-flash';

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

async function callDeepSeek(systemPrompt: string, parts: GeminiPart[]): Promise<string> {
  if (!DEEPSEEK_API_KEY) throw new Error('DeepSeek key not configured');

  // DeepSeek's API is text-only — no vision support — so like the original
  // Groq fallback, we collapse to text and flag any dropped attachments.
  const textContent = parts.filter(p => p.text).map(p => p.text).join('\n\n');
  const hadAttachments = parts.some(p => p.inline_data);
  const userContent = hadAttachments
    ? `${textContent}\n\n[Note: one or more attached files could not be processed by the fallback model. Let the user know you can't read the attachment right now and ask them to retry shortly.]`
    : textContent;

  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      temperature: 0.0,
      max_tokens: 4096,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
    }),
  });

  // Read as text first and parse defensively — a gateway returning an "ok"
  // status with a non-JSON body should surface a clear error instead of
  // throwing an unhandled parse exception.
  const rawText = await response.text();
  let data: any;
  try {
    data = JSON.parse(rawText);
  } catch {
    throw new Error(`DeepSeek returned a non-JSON response (status ${response.status}): ${rawText.slice(0, 200)}`);
  }

  if (!response.ok) {
    throw new Error(data?.error?.message || `DeepSeek API error (${response.status})`);
  }

  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('DeepSeek returned an empty response');

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
    console.error('[ai-gateway] Gemini failed, falling back to DeepSeek:', geminiError.message);

    try {
      const text = await callDeepSeek(systemPrompt, parts);
      return new Response(JSON.stringify({ text, provider: 'deepseek' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (deepSeekError: any) {
      console.error('[ai-gateway] DeepSeek fallback also failed:', deepSeekError.message);
      return new Response(
        JSON.stringify({ error: 'Both AI providers are currently unavailable. Please try again shortly.' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }
});
