import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

export async function POST(req) {
  const { messages } = await req.json()

  const response = streamText({
    model: openai("gpt-4-turbo"),
    messages,
    initial:
      "Hi! I'm your AI assistant. I can help you with features, answer questions, and resolve any issues you have.",
  })

  return response.toDataStreamResponse()
}
