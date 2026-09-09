const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"

// Free tier models (all available via OPENROUTER_MODEL env var):
//   nvidia/nemotron-3-super-120b-a12b:free        (default, 120B params, reliable)
//   nvidia/nemotron-3-ultra-550b-a55b:free         (550B params, strongest)
//   nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free (30B, reasoning-focused)
//   google/gemma-4-31b-it:free                     (31B, rate-limited)
//   openai/gpt-oss-20b                             (paid, check OpenRouter for pricing)
const MODEL = process.env.OPENROUTER_MODEL || "nvidia/nemotron-3-super-120b-a12b:free"

export interface ChatMessage {
  role: "system" | "user" | "assistant"
  content: string
}

export interface AIResponse {
  content: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export async function chatCompletion(
  messages: ChatMessage[],
  options?: {
    temperature?: number
    maxTokens?: number
    json?: boolean
  }
): Promise<AIResponse> {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not configured")
  }

  const body: Record<string, unknown> = {
    model: MODEL,
    messages,
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens ?? 1024,
  }

  if (options?.json) {
    body.response_format = { type: "json_object" }
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "HTTP-Referer": process.env.NEXTAUTH_URL || "http://localhost:3000",
      "X-Title": "CoachFlow AI",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`OpenRouter API error ${response.status}: ${errorText}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content ?? ""

  return {
    content,
    usage: data.usage,
  }
}

export async function chatCompletionStream(
  messages: ChatMessage[],
  options?: {
    temperature?: number
    maxTokens?: number
  }
): Promise<ReadableStream> {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not configured")
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "HTTP-Referer": process.env.NEXTAUTH_URL || "http://localhost:3000",
      "X-Title": "CoachFlow AI",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 1024,
      stream: true,
    }),
    cache: "no-store",
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`OpenRouter API error ${response.status}: ${errorText}`)
  }

  if (!response.body) {
    throw new Error("No response body from OpenRouter")
  }

  return response.body
}
