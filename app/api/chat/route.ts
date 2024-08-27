import { Configuration, OpenAIApi } from 'openai-edge'
import { OpenAIStream, StreamingTextResponse } from 'ai'

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})
const openai = new OpenAIApi(config)

export const runtime = 'edge'

export async function POST(req: Request) {
  const { messages, experimental_attachments } = await req.json()

  const apiMessages = [
    {
      role: 'system',
      content: 'You are a helpful AI assistant specializing in legal advice for founders. Provide clear, concise answers to legal questions, and when appropriate, suggest getting professional legal counsel.'
    },
    ...messages
  ]

  // Handle attachments
  if (experimental_attachments && experimental_attachments.length > 0) {
    const attachmentContents = experimental_attachments
      .filter((attachment: any) => attachment.contentType.startsWith('text/'))
      .map((attachment: any) => `File: ${attachment.name}\nContent: ${attachment.content}`)
      .join('\n\n')

    if (attachmentContents) {
      apiMessages.push({
        role: 'system',
        content: `Context from attached files:\n${attachmentContents}`
      })
    }
  }

  console.log('API Messages:', JSON.stringify(apiMessages, null, 2))

  try {
    console.log('Calling OpenAI API')
    const response = await openai.createChatCompletion({
      model: 'gpt-4o',
      stream: true,
      messages: apiMessages
    })
    console.log('Received response from OpenAI API')

    const stream = OpenAIStream(response)
    return new StreamingTextResponse(stream)
  } catch (error) {
    console.error('Error calling OpenAI API:', error)
    return new Response('Error processing your request', { status: 500 })
  }
}