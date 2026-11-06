import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { connectToDatabase } from "@/lib/mongodb";
import { Review } from "@/models/Review";
import { ReadingLog } from "@/models/ReadingLog";
import { User } from "@/models/User";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "all"; // "following" | "all"

    const currentUser = await getCurrentUser();

    let userIdsToFetch: any[] = [];
    if (filter === "following" && currentUser && currentUser.following?.length > 0) {
      userIdsToFetch = [...currentUser.following, currentUser._id];
    }

    const reviewQuery: any = {};
    if (userIdsToFetch.length > 0) {
      reviewQuery.user = { $in: userIdsToFetch };
    }

    // Fetch recent reviews
    const recentReviews = await Review.find(reviewQuery)
      .populate("user", "name username avatarUrl")
      .populate("book", "title author coverImage slug publishYear")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    // Fetch popular/suggested readers to follow
    const suggestedUsers = await User.find(
      currentUser ? { _id: { $ne: currentUser._id } } : {}
    )
      .select("name username avatarUrl bio followers")
      .limit(5)
      .lean();

    return NextResponse.json({
      activities: recentReviews,
      suggestedUsers,
    });
  } catch (error: any) {
    console.error("Activity feed error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch activities" },
      { status: 500 }
    );
  }
}

