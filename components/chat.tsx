import { useState } from "react";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Loader2, Send } from "lucide-react";
import { toast } from "./ui/use-toast";

export default function Chat({ content }: { content: string }) {
  const [chatMessages, setChatMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [userMessage, setUserMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const handleSendMessage = async () => {
    if (userMessage.trim() && !isLoading) {
      const newMessage = { role: "user" as const, content: userMessage };
      setChatMessages((prev) => [...prev, newMessage]);
      setUserMessage("");
      setIsLoading(true);

      try {
        const response = await fetch('/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [
              {
                role: "system",
                content: "You are a legal document assistant. Answer questions based on the following document content:" + content,
              },
              ...chatMessages,
              newMessage,
            ],
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to get response from API');
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let aiResponse = "";

        while (true) {
          const { done, value } = await reader!.read();
          if (done) break;
          const chunk = decoder.decode(value);
          aiResponse += chunk;
          setChatMessages((prev) => [
            ...prev.slice(0, -1),
            { role: "assistant", content: aiResponse },
          ]);
        }
      } catch (error) {
        console.error("Error sending message:", error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to send message. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chat with AI</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500 mb-4">
          Ask questions about the legal document
        </p>
        <ScrollArea className="h-64 border rounded-md p-4 mb-4">
          {chatMessages.map((message, index) => (
            <div
              key={index}
              className={`mb-4 ${
                message.role === "user" ? "text-right" : "text-left"
              }`}
            >
              <div
                className={`inline-block p-2 rounded-lg ${
                  message.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
        </ScrollArea>
        <div className="flex space-x-2">
          <Textarea
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            placeholder="Type your question here..."
            className="flex-grow"
            disabled={isLoading || !content}
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !content}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}