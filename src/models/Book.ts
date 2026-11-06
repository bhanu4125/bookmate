import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRatingDistribution {
  [star: string]: number;
}

export interface IBook extends Document {
  _id: mongoose.Types.ObjectId;
  slug: string;
  title: string;
  author: string;
  isbn?: string;
  coverImage: string;
  description?: string;
  publishYear?: number;
  publisher?: string;
  pageCount?: number;
  genres: string[];
  language: string;
  averageRating: number;
  ratingsCount: number;
  ratingDistribution: {
    "0.5": number;
    "1.0": number;
    "1.5": number;
    "2.0": number;
    "2.5": number;
    "3.0": number;
    "3.5": number;
    "4.0": number;
    "4.5": number;
    "5.0": number;
  };
  readsCount: number;
  wantToReadCount: number;
  listsCount: number;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BookSchema = new Schema<IBook>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true, index: true },
    author: { type: String, required: true, trim: true, index: true },
    isbn: { type: String, trim: true, index: true },
    coverImage: { type: String, required: true },
    description: { type: String, default: "" },
    publishYear: { type: Number, index: true },
    publisher: { type: String, default: "" },
    pageCount: { type: Number, default: 0 },
    genres: [{ type: String, trim: true, index: true }],
    language: { type: String, default: "en" },
    averageRating: { type: Number, default: 0, index: true },
    ratingsCount: { type: Number, default: 0 },
    ratingDistribution: {
      "0.5": { type: Number, default: 0 },
      "1.0": { type: Number, default: 0 },
      "1.5": { type: Number, default: 0 },
      "2.0": { type: Number, default: 0 },
      "2.5": { type: Number, default: 0 },
      "3.0": { type: Number, default: 0 },
      "3.5": { type: Number, default: 0 },
      "4.0": { type: Number, default: 0 },
      "4.5": { type: Number, default: 0 },
      "5.0": { type: Number, default: 0 },
    },
    readsCount: { type: Number, default: 0 },
    wantToReadCount: { type: Number, default: 0 },
    listsCount: { type: Number, default: 0 },
    featured: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

BookSchema.index({ title: "text", author: "text", description: "text" });
BookSchema.index({ averageRating: -1, ratingsCount: -1 });

export const Book: Model<IBook> =
  mongoose.models.Book || mongoose.model<IBook>("Book", BookSchema);

export default Book;

