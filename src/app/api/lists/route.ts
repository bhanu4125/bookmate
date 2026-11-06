import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { List } from "@/models/List";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const tag = searchParams.get("tag");
    const sort = searchParams.get("sort") || "popular";

    const query: any = { isPrivate: false };
    if (tag) {
      query.tags = tag;
    }

    let sortOption: any = { "likes.length": -1, createdAt: -1 };
    if (sort === "newest") {
      sortOption = { createdAt: -1 };
    }

    const lists = await List.find(query)
      .populate("user", "name username avatarUrl")
      .populate("books.book", "title author coverImage slug publishYear averageRating")
      .sort(sortOption)
      .limit(30)
      .lean();

    return NextResponse.json({ lists });
  } catch (error: any) {
    console.error("Fetch lists error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch lists" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, isRanked, isPrivate, books, tags } = await req.json();

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "List title is required" }, { status: 400 });
    }

    await connectToDatabase();

    const slug = `${title.toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-")}-${Date.now().toString(36)}`;

    const formattedBooks = (books || []).map((b: any, index: number) => ({
      book: b.bookId || b._id,
      note: b.note || "",
      order: index + 1,
    }));

    const newList = await List.create({
      user: user._id,
      title: title.trim(),
      slug,
      description: description || "",
      isRanked: !!isRanked,
      isPrivate: !!isPrivate,
      books: formattedBooks,
      tags: tags || [],
    });

    return NextResponse.json({ success: true, list: newList });
  } catch (error: any) {
    console.error("Create list error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create list" },
      { status: 500 }
    );
  }
}
