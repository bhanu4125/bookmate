import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { List } from "@/models/List";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    await connectToDatabase();

    const originalList = await List.findById(id);
    if (!originalList) {
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }

    const newTitle = `${originalList.title} (Cloned)`;
    const newSlug = `${originalList.slug}-cloned-${Date.now().toString(36)}`;

    const clonedList = await List.create({
      user: user._id,
      title: newTitle,
      slug: newSlug,
      description: originalList.description,
      isRanked: originalList.isRanked,
      isPrivate: false,
      books: originalList.books,
      tags: originalList.tags,
    });

    return NextResponse.json({ success: true, list: clonedList });
  } catch (error: any) {
    console.error("Clone list error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to clone list" },
      { status: 500 }
    );
  }
}
