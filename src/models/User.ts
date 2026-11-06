import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  username: string;
  email: string;
  password?: string;
  avatarUrl?: string;
  bio?: string;
  location?: string;
  website?: string;
  topBooks: mongoose.Types.ObjectId[];
  readingChallengeYear: number;
  readingChallengeGoal: number;
  followers: mongoose.Types.ObjectId[];
  following: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 2,
      maxlength: 30,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    password: { type: String, select: false },
    avatarUrl: {
      type: String,
      default: "https://avatar.vercel.sh/bookmate-user.png",
    },
    bio: { type: String, default: "Passionate reader on Bookmate." },
    location: { type: String, default: "" },
    website: { type: String, default: "" },
    topBooks: [{ type: Schema.Types.ObjectId, ref: "Book", default: [] }],
    readingChallengeYear: { type: Number, default: () => new Date().getFullYear() },
    readingChallengeGoal: { type: Number, default: 25 },
    followers: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
    following: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;

