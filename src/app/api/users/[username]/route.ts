import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { ReadingLog } from "@/models/ReadingLog";
import { Review } from "@/models/Review";
import { List } from "@/models/List";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;
    await connectToDatabase();

    const user = await User.findOne({ username: username.toLowerCase() })
      .populate("topBooks")
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(`${currentYear}-01-01T00:00:00.000Z`);

    // Count books read this year
    const booksReadThisYear = await ReadingLog.countDocuments({
      user: user._id,
      status: "read",
      readDate: { $gte: startOfYear },
    });

    // Total books logged ever
    const totalBooksLogged = await ReadingLog.countDocuments({
      user: user._id,
      status: "read",
    });

    // Reviews count
    const totalReviews = await Review.countDocuments({ user: user._id });

    // Public lists count
    const totalLists = await List.countDocuments({ user: user._id, isPrivate: false });

    // Recent diary entries
    const recentLogs = await ReadingLog.find({ user: user._id })
      .populate("book")
      .sort({ readDate: -1 })
      .limit(6)
      .lean();

    // Check if authenticated user follows this user
    const currentUser = await getCurrentUser();
    const isFollowing = currentUser
      ? user.followers?.some((fid: any) => fid.toString() === currentUser._id.toString())
      : false;

    const isOwnProfile = currentUser
      ? currentUser._id.toString() === user._id.toString()
      : false;

    return NextResponse.json({
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        location: user.location,
        website: user.website,
        topBooks: user.topBooks || [],
        readingChallengeYear: user.readingChallengeYear || currentYear,
        readingChallengeGoal: user.readingChallengeGoal || 25,
        followersCount: user.followers?.length || 0,
        followingCount: user.following?.length || 0,
        createdAt: user.createdAt,
      },
      stats: {
        booksReadThisYear,
        totalBooksLogged,
        totalReviews,
        totalLists,
      },
      recentLogs,
      isFollowing,
      isOwnProfile,
    });
  } catch (error: any) {
    console.error("Fetch profile error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { username } = params;
    if (currentUser.username.toLowerCase() !== username.toLowerCase()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectToDatabase();
    const { bio, topBooks, readingChallengeGoal } = await req.json();

    const updateFields: any = {};
    if (bio !== undefined) updateFields.bio = bio;
    if (topBooks !== undefined) updateFields.topBooks = topBooks.slice(0, 4);
    if (readingChallengeGoal !== undefined)
      updateFields.readingChallengeGoal = Number(readingChallengeGoal);

    const updatedUser = await User.findByIdAndUpdate(
      currentUser._id,
      { $set: updateFields },
      { new: true }
    ).populate("topBooks");

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}

