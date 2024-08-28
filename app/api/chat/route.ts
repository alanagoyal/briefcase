import { Configuration, OpenAIApi } from 'openai-edge'
import { OpenAIStream, StreamingTextResponse } from 'ai'

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})
const openai = new OpenAIApi(config)

// export const runtime = 'edge'

export async function POST(req: Request) {
  console.log('Received POST request to /api/chat')
  
  const { messages, documentContexts } = await req.json()
  console.log('Received messages:', messages)
  console.log('Document contexts:', documentContexts ? 'Present' : 'Not provided')

  const apiMessages = [
    {
      role: 'system',
      content: 'You are a helpful AI assistant specializing in legal advice for founders. Provide clear, concise answers to legal questions, and when appropriate, suggest getting professional legal counsel. Use markdown formatting for your responses, including code blocks with language specification when appropriate.'
    },
    // Add document contexts if available
    ...(documentContexts ? [{
      role: 'system',
      content: `Context from uploaded documents:\n${documentContexts}\n\nPlease consider this context for all future responses in this conversation.`
    }] : []),
    ...messages
  ]

  console.log('Prepared API messages:', apiMessages)

  try {
    console.log('Calling OpenAI API...')
    const response = await openai.createChatCompletion({
      model: 'gpt-4o-mini',
      stream: true,
      messages: apiMessages
    })
    console.log('Received response from OpenAI API')

    const stream = OpenAIStream(response)
    console.log('Created OpenAIStream')
    return new StreamingTextResponse(stream)
  } catch (error) {
    console.error('Error calling OpenAI API:', error)
    return new Response('Error processing your request', { status: 500 })
  }
}