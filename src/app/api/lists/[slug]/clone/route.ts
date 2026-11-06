import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { List } from "@/models/List";
import { getCurrentUser } from "@/lib/auth";
import mongoose from "mongoose";

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = params;
    await connectToDatabase();

    const isObjectId = mongoose.Types.ObjectId.isValid(slug);
    const originalList = await List.findOne({
      $or: [{ slug }, ...(isObjectId ? [{ _id: slug }] : [])],
    });

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

