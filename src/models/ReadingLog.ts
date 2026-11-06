import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReadingLog extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  book: mongoose.Types.ObjectId;
  readDate: Date;
  status: "read" | "currently-reading" | "want-to-read" | "dnf";
  rating?: number;
  review?: mongoose.Types.ObjectId;
  format: "Paperback" | "Hardcover" | "Kindle / E-Book" | "Audiobook";
  isReread: boolean;
  notes?: string;
  tags: string[];
  pagesRead?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ReadingLogSchema = new Schema<IReadingLog>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    book: { type: Schema.Types.ObjectId, ref: "Book", required: true, index: true },
    readDate: { type: Date, default: Date.now, index: true },
    status: {
      type: String,
      enum: ["read", "currently-reading", "want-to-read", "dnf"],
      default: "read",
      index: true,
    },
    rating: { type: Number, min: 0.5, max: 5.0 },
    review: { type: Schema.Types.ObjectId, ref: "Review" },
    format: {
      type: String,
      enum: ["Paperback", "Hardcover", "Kindle / E-Book", "Audiobook"],
      default: "Paperback",
    },
    isReread: { type: Boolean, default: false },
    notes: { type: String, default: "" },
    tags: [{ type: String, trim: true }],
    pagesRead: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ReadingLogSchema.index({ user: 1, readDate: -1 });
ReadingLogSchema.index({ user: 1, book: 1 });
ReadingLogSchema.index({ user: 1, status: 1 });

export const ReadingLog: Model<IReadingLog> =
  mongoose.models.ReadingLog || mongoose.model<IReadingLog>("ReadingLog", ReadingLogSchema);

export default ReadingLog;

