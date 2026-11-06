export type ReadingStatus = "read" | "currently-reading" | "want-to-read" | "dnf";

export type BookFormat = "Paperback" | "Hardcover" | "Kindle / E-Book" | "Audiobook";

export interface BookMetadata {
  _id?: string;
  isbn?: string;
  title: string;
  author: string;
  coverImage: string;
  description?: string;
  pageCount?: number;
  publishYear?: number;
  publisher?: string;
  genres: string[];
  averageRating?: number;
  ratingsCount?: number;
  ratingDistribution?: {
    [star: string]: number; // e.g. "0.5", "1.0", ... "5.0"
  };
}

export interface UserSession {
  id: string;
  name: string;
  username: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
}

