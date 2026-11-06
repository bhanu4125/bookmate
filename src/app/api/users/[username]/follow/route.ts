import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { username } = params;
    await connectToDatabase();

    const targetUser = await User.findOne({ username: username.toLowerCase() });
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (targetUser._id.toString() === currentUser._id.toString()) {
      return NextResponse.json(
        { error: "Cannot follow yourself" },
        { status: 400 }
      );
    }

    const isFollowing = currentUser.following.some(
      (id) => id.toString() === targetUser._id.toString()
    );

    if (isFollowing) {
      // Unfollow
      await User.findByIdAndUpdate(currentUser._id, {
        $pull: { following: targetUser._id },
      });
      await User.findByIdAndUpdate(targetUser._id, {
        $pull: { followers: currentUser._id },
      });
    } else {
      // Follow
      await User.findByIdAndUpdate(currentUser._id, {
        $addToSet: { following: targetUser._id },
      });
      await User.findByIdAndUpdate(targetUser._id, {
        $addToSet: { followers: currentUser._id },
      });
    }

    const updatedTarget = await User.findById(targetUser._id).select("followers");
    const followersCount = updatedTarget?.followers?.length || 0;

    return NextResponse.json({
      success: true,
      isFollowing: !isFollowing,
      followersCount,
    });
  } catch (error: any) {
    console.error("Follow error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update follow" },
      { status: 500 }
    );
  }
}

