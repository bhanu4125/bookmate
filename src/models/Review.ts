import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReviewComment {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
}

export interface IReview extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  book: mongoose.Types.ObjectId;
  rating?: number;
  content: string;
  containsSpoilers: boolean;
  likes: mongoose.Types.ObjectId[];
  comments: IReviewComment[];
  quotes: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    book: { type: Schema.Types.ObjectId, ref: "Book", required: true, index: true },
    rating: { type: Number, min: 0.5, max: 5.0 },
    content: { type: String, required: true },
    containsSpoilers: { type: Boolean, default: false },
    likes: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
    comments: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    quotes: [{ type: String, default: [] }],
  },
  { timestamps: true }
);

ReviewSchema.index({ book: 1, createdAt: -1 });
ReviewSchema.index({ user: 1, createdAt: -1 });
ReviewSchema.index({ likes: 1 });

export const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);

export default Review;

