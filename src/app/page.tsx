import Link from "next/link";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">RAG Assistant</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Link href="/pdf-chat" 
          className="p-6 border rounded-lg hover:border-primary transition-colors">
          <h2 className="text-2xl font-semibold mb-2">Chat with PDF</h2>
          <p className="text-muted-foreground">
            Upload a PDF document and ask questions about its content. Get accurate answers powered by Google Gemini.
          </p>
        </Link>

        <Link href="/youtube-chat"
          className="p-6 border rounded-lg hover:border-primary transition-colors">
          <h2 className="text-2xl font-semibold mb-2">Chat with YouTube</h2>
          <p className="text-muted-foreground">
            Enter a YouTube video URL and ask questions about its content. Get insights from video transcripts using AI.
          </p>
        </Link>
      </div>
    </div>
  );
}
