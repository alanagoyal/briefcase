import { Configuration, OpenAIApi } from 'openai-edge'
import { OpenAIStream, StreamingTextResponse } from 'ai'

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})
const openai = new OpenAIApi(config)

export const runtime = 'edge'

export async function POST(req: Request) {
  const { messages, content } = await req.json()

  // Extract file content if present
  const fileContentMatch = content.match(/File content:\n([\s\S]*)/i)
  const fileContent = fileContentMatch ? fileContentMatch[1].trim() : ''
  console.log(`File content ${fileContent ? 'found' : 'not found'} in the message`)
  if (fileContent) {
    console.log(`File content length: ${fileContent.length}`)
  }

  const apiMessages = [
    {
      role: 'system',
      content: 'You are a helpful AI assistant specializing in legal advice for founders. Provide clear, concise answers to legal questions, and when appropriate, suggest getting professional legal counsel.'
    },
    ...messages,
    {
      role: 'user',
      content: content
    }
  ]

  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-4o',
      stream: true,
      messages: apiMessages
    })

    const stream = OpenAIStream(response)
    return new StreamingTextResponse(stream)
  } catch (error) {
    console.error('Error calling OpenAI API:', error)
    return new Response('Error processing your request', { status: 500 })
  }
}