import { NextResponse } from "next/server";
import { processPDF } from "@/lib/pdf-utils";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const textContent = await processPDF(buffer);

    return NextResponse.json({ textContent });
  } catch (error) {
    console.error("Error in PDF processing:", error);
    return NextResponse.json(
      { error: "Failed to process PDF" },
      { status: 500 }
    );
  }
} 