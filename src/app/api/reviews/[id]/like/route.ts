import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Review } from "@/models/Review";
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

    const review = await Review.findById(id);
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const userIdStr = user._id.toString();
    const existingIndex = review.likes.findIndex(
      (uid) => uid.toString() === userIdStr
    );

    let hasLiked = false;
    if (existingIndex > -1) {
      review.likes.splice(existingIndex, 1);
      hasLiked = false;
    } else {
      review.likes.push(user._id);
      hasLiked = true;
    }

    await review.save();

    return NextResponse.json({
      success: true,
      hasLiked,
      likesCount: review.likes.length,
    });
  } catch (error: any) {
    console.error("Like review error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update like" },
      { status: 500 }
    );
  }
}

