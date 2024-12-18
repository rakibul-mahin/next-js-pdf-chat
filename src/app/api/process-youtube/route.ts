import { NextResponse } from "next/server";
import { extractVideoId, getTranscript } from "@/lib/youtube-utils";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    
    if (!url) {
      return NextResponse.json(
        { error: "No URL provided" },
        { status: 400 }
      );
    }

    const videoId = extractVideoId(url);
    const transcript = await getTranscript(videoId);

    return NextResponse.json({ transcript });
  } catch (error) {
    console.error("Error in YouTube processing:", error);
    return NextResponse.json(
      { error: "Failed to process YouTube video" },
      { status: 500 }
    );
  }
} 