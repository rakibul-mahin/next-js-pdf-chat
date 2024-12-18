import { YoutubeTranscript } from 'youtube-transcript-api';
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export function extractVideoId(url: string): string {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  if (!match) throw new Error("Invalid YouTube URL");
  return match[1];
}

export async function getTranscript(videoId: string) {
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    const fullText = transcript.map(item => item.text).join(" ");
    
    // Split the text into chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    
    const splitDocs = await textSplitter.createDocuments([fullText]);
    
    return splitDocs.map(doc => doc.pageContent);
  } catch (error) {
    console.error("Error fetching transcript:", error);
    throw new Error("Failed to fetch video transcript");
  }
} 