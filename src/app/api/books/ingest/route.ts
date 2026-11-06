import { NextRequest, NextResponse } from "next/server";
import { ingestBookToDatabase } from "@/services/bookService";

export async function POST(req: NextRequest) {
  try {
    const bookData = await req.json();

    if (!bookData.title || !bookData.author) {
      return NextResponse.json(
        { error: "Title and author are required" },
        { status: 400 }
      );
    }

    const savedBook = await ingestBookToDatabase(bookData);

    return NextResponse.json({
      success: true,
      book: savedBook,
    });
  } catch (error: any) {
    console.error("Ingest error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to ingest book" },
      { status: 500 }
    );
  }
}

