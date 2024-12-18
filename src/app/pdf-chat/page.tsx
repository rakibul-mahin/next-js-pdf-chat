"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PDFChat() {
  const [file, setFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pdfContent, setPdfContent] = useState<string[]>([]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setIsLoading(true);
      
      // Process PDF file
      const formData = new FormData();
      formData.append('file', e.target.files[0]);
      
      try {
        const response = await fetch('/api/process-pdf', {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        if (data.error) {
          console.error(data.error);
        } else {
          setPdfContent(data.textContent);
          setMessages(prev => [
            ...prev,
            {
              role: 'assistant',
              content: 'PDF processed successfully. You can now ask questions about its content.'
            }
          ]);
        }
      } catch (error) {
        console.error('Error processing PDF:', error);
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: 'Failed to process the PDF. Please try again.'
          }
        ]);
      } finally {
        setIsLoading(false);
      }
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
          context: pdfContent.join('\n'),
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
        <h1 className="text-3xl font-bold mb-8">Chat with PDF</h1>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Upload PDF Document
          </label>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
          />
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
              placeholder="Ask a question about the PDF..."
              className="flex-1 p-2 border rounded-md"
              disabled={!file || isLoading}
            />
            <Button type="submit" variant="primary" disabled={!file || isLoading}>
              Send
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
} 