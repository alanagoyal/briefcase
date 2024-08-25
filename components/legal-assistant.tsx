"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Paperclip, Send, Loader2, Copy, RefreshCw, ThumbsUp, ThumbsDown } from "lucide-react"
import { useChat } from 'ai/react'

export default function Component() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, reload } = useChat({
    api: '/api/chat',
  })
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim() && !file) return

    let content = input
    if (file) {
      console.log(`Handling file: ${file.name}, type: ${file.type}, size: ${file.size} bytes`)
      const fileContent = await readFileContent(file)
      content += `\n\nFile content:\n${fileContent}`
      console.log(`File content added to message. Total content length: ${content.length}`)
    }

    console.log('Submitting message to API')
    try {
      await handleSubmit(e, { options: { body: { content } } })
    } catch (error) {
      console.error('Error submitting message:', error)
      // Handle the error appropriately (e.g., show an error message to the user)
    }
    setFile(null)
  }

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        console.log(`File read successfully. Result length: ${(event.target?.result as string).length}`)
        resolve(event.target?.result as string)
      }
      reader.onerror = (error) => {
        console.error('Error reading file:', error)
        reject(error)
      }
      
      console.log('Reading file as text')
      reader.readAsText(file)
    })
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      console.log(`File selected: ${file.name}, type: ${file.type}, size: ${file.size} bytes`)
      setFile(file)
    }
  }

  const handleGetQuote = () => {
    handleSubmit(undefined, {
      options: {
        body: {
          messages: [
            ...messages,
            {
              content: "Please provide a quote for legal services based on the previous conversation.",
              role: 'user'
            }
          ]
        }
      }
    })
  }

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  const handleRetry = () => {
    reload()
  }

  const handleFeedback = (isPositive: boolean) => {
    // Implement feedback logic here
    console.log(`User gave ${isPositive ? 'positive' : 'negative'} feedback`)
  }

  return (
    <div className="flex-1 flex flex-col">
      <header className="bg-background border-b p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Founder Legal Question App</h1>
        <Button variant="outline">Share</Button>
      </header>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
          {messages.map((message, index) => (
            <div key={index} className={`mb-4 ${message.role === "user" ? "text-right" : "text-left"}`}>
              <div className={`inline-block p-2 rounded-lg ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}>
                <p>{message.content}</p>
              </div>
              {message.role === "assistant" && (
                <div className="mt-2 flex items-center space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => handleCopy(message.content)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleRetry}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleFeedback(true)}>
                    <ThumbsUp className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleFeedback(false)}>
                    <ThumbsDown className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleGetQuote}>
                    Get Quote
                  </Button>
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
        </ScrollArea>
      </div>

      <div className="p-4 border-t bg-background">
        <form onSubmit={handleSend} className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Type your message..."
              value={input}
              onChange={handleInputChange}
              className="flex-1"
            />
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileUpload}
            />
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button type="submit" size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {file && (
            <p className="text-sm text-muted-foreground">
              File selected: {file.name}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}