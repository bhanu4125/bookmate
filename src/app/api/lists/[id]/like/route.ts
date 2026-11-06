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

    const list = await List.findById(id);
    if (!list) {
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }

    const uidStr = user._id.toString();
    const existingIdx = list.likes.findIndex((uid) => uid.toString() === uidStr);

    let hasLiked = false;
    if (existingIdx > -1) {
      list.likes.splice(existingIdx, 1);
      hasLiked = false;
    } else {
      list.likes.push(user._id);
      hasLiked = true;
    }

    await list.save();

    return NextResponse.json({
      success: true,
      hasLiked,
      likesCount: list.likes.length,
    });
  } catch (error: any) {
    console.error("Like list error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update like" },
      { status: 500 }
    );
  }
}
