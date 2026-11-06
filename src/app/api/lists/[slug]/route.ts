import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { List } from "@/models/List";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    await connectToDatabase();

    const list = await List.findOne({ slug })
      .populate("user", "name username avatarUrl bio")
      .populate("books.book", "title author coverImage slug publishYear averageRating ratingsCount")
      .lean();

    if (!list) {
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }

    const currentUser = await getCurrentUser();
    const hasLiked = currentUser
      ? list.likes?.some((id: any) => id.toString() === currentUser._id.toString())
      : false;

    return NextResponse.json({
      list,
      hasLiked,
      isOwner: currentUser
        ? (list.user as any)?._id.toString() === currentUser._id.toString()
        : false,
    });
  } catch (error: any) {
    console.error("Fetch list detail error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch list" },
      { status: 500 }
    );
  }
}
