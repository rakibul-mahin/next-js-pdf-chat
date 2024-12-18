"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function YouTubeChat() {
  const [videoUrl, setVideoUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [transcriptContent, setTranscriptContent] = useState<string[]>([]);

  const handleVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl) return;

    setIsProcessing(true);
    try {
      const response = await fetch('/api/process-youtube', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: videoUrl }),
      });

      const data = await response.json();
      if (data.error) {
        console.error(data.error);
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: 'Failed to process the video. Please check the URL and try again.'
          }
        ]);
      } else {
        setTranscriptContent(data.transcript);
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: 'Video transcript processed successfully. You can now ask questions about its content.'
          }
        ]);
      }
    } catch (error) {
      console.error("Error processing video:", error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Failed to process the video. Please try again.'
        }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          context: transcriptContent.join('\n'),
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant' as const, content: data.content }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <Link href="/" className="text-primary hover:underline">
          ← Back to Home
        </Link>
      </div>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Chat with YouTube Video</h1>

        <div className="mb-6">
          <form onSubmit={handleVideoSubmit} className="flex gap-2">
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Enter YouTube video URL..."
              className="flex-1 p-2 border rounded-md"
              required
            />
            <Button
              type="submit"
              variant="primary"
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Process Video"}
            </Button>
          </form>
        </div>

        <div className="border rounded-lg p-4 min-h-[500px] flex flex-col">
          <div className="flex-1 overflow-y-auto mb-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-4 ${
                  message.role === "assistant"
                    ? "bg-muted p-3 rounded-lg"
                    : "bg-primary/10 p-3 rounded-lg"
                }`}
              >
                <p>{message.content}</p>
              </div>
            ))}
            {isLoading && (
              <div className="bg-muted p-3 rounded-lg mb-4">
                <p>Thinking...</p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about the video..."
              className="flex-1 p-2 border rounded-md"
              disabled={!transcriptContent.length || isLoading}
            />
            <Button 
              type="submit" 
              variant="primary" 
              disabled={!transcriptContent.length || isLoading}
            >
              Send
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
} 