import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

if (!process.env.GOOGLE_API_KEY) {
  throw new Error("Missing GOOGLE_API_KEY environment variable");
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export async function POST(req: Request) {
  try {
    const { messages, context } = await req.json();
    const lastMessage = messages[messages.length - 1];

    // Build prompt with context if available
    const prompt = context 
      ? `Context: ${context}\n\nQuestion: ${lastMessage.content}\n\nAnswer based on the context provided:`
      : lastMessage.content;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ content: text });
  } catch (error) {
    console.error("Error in chat:", error);
    return NextResponse.json(
      { error: "Failed to process chat" },
      { status: 500 }
    );
  }
} 