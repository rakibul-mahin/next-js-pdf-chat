import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export async function processPDF(file: Buffer) {
  try {
    // Create a Blob from the buffer
    const blob = new Blob([file], { type: 'application/pdf' });
    
    // Load the PDF
    const loader = new PDFLoader(blob);
    const docs = await loader.load();
    
    // Split the text into chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    
    const splitDocs = await textSplitter.splitDocuments(docs);
    
    // Extract and return the text content
    return splitDocs.map(doc => doc.pageContent);
  } catch (error) {
    console.error("Error processing PDF:", error);
    throw new Error("Failed to process PDF file");
  }
} 