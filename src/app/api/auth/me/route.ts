import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        location: user.location,
        website: user.website,
        topBooks: user.topBooks,
        readingChallengeYear: user.readingChallengeYear,
        readingChallengeGoal: user.readingChallengeGoal,
        followersCount: user.followers?.length || 0,
        followingCount: user.following?.length || 0,
      },
    });
  } catch (error: any) {
    console.error("Get me error:", error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
