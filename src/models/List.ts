import mongoose, { Schema, Document, Model } from "mongoose";

export interface IListBook {
  book: mongoose.Types.ObjectId;
  note?: string;
  order: number;
}

export interface IList extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  description: string;
  isRanked: boolean;
  isPrivate: boolean;
  books: IListBook[];
  likes: mongoose.Types.ObjectId[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ListSchema = new Schema<IList>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true },
    description: { type: String, default: "" },
    isRanked: { type: Boolean, default: false },
    isPrivate: { type: Boolean, default: false },
    books: [
      {
        book: { type: Schema.Types.ObjectId, ref: "Book", required: true },
        note: { type: String, default: "" },
        order: { type: Number, default: 0 },
      },
    ],
    likes: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

ListSchema.index({ user: 1, createdAt: -1 });
ListSchema.index({ slug: 1, user: 1 });
ListSchema.index({ likes: -1 });

export const List: Model<IList> =
  mongoose.models.List || mongoose.model<IList>("List", ListSchema);

export default List;
