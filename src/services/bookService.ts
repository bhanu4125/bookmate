import { connectToDatabase } from "@/lib/mongodb";
import { Book, IBook } from "@/models/Book";

export interface ExternalBookResult {
  title: string;
  author: string;
  isbn?: string;
  coverImage: string;
  publishYear?: number;
  publisher?: string;
  pageCount?: number;
  genres: string[];
  description?: string;
  openLibraryKey?: string;
}

export function generateSlug(title: string, author: string): string {
  const base = `${title}-${author}`
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
  return base.slice(0, 80);
}

export async function searchOpenLibrary(query: string, limit: number = 10): Promise<ExternalBookResult[]> {
  try {
    const encoded = encodeURIComponent(query);
    const url = `https://openlibrary.org/search.json?q=${encoded}&limit=${limit}&fields=key,title,author_name,isbn,cover_i,first_publish_year,publisher,number_of_pages_median,subject`;
    
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) {
      console.warn("OpenLibrary search failed with status:", res.status);
      return [];
    }

    const data = await res.json();
    if (!data.docs || !Array.isArray(data.docs)) {
      return [];
    }

    return data.docs.map((doc: any) => {
      const author = Array.isArray(doc.author_name) ? doc.author_name[0] : "Unknown Author";
      const isbn = Array.isArray(doc.isbn) ? doc.isbn[0] : undefined;
      const coverImage = doc.cover_i
        ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
        : isbn
        ? `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`
        : "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80";

      const genres = Array.isArray(doc.subject)
        ? doc.subject.slice(0, 5).map((s: string) => s.trim())
        : ["Fiction"];

      return {
        title: doc.title,
        author,
        isbn,
        coverImage,
        publishYear: doc.first_publish_year || undefined,
        publisher: Array.isArray(doc.publisher) ? doc.publisher[0] : undefined,
        pageCount: doc.number_of_pages_median || undefined,
        genres,
        openLibraryKey: doc.key,
      };
    });
  } catch (error) {
    console.error("OpenLibrary search error:", error);
    return [];
  }
}

export async function ingestBookToDatabase(bookData: ExternalBookResult): Promise<IBook> {
  await connectToDatabase();
  const slug = generateSlug(bookData.title, bookData.author);

  let existing = await Book.findOne({
    $or: [{ slug }, ...(bookData.isbn ? [{ isbn: bookData.isbn }] : [])],
  });

  if (existing) {
    return existing;
  }

  const newBook = await Book.create({
    slug,
    title: bookData.title,
    author: bookData.author,
    isbn: bookData.isbn,
    coverImage: bookData.coverImage,
    description: bookData.description || `An acclaimed work by ${bookData.author}.`,
    publishYear: bookData.publishYear || new Date().getFullYear(),
    publisher: bookData.publisher || "Independent",
    pageCount: bookData.pageCount || 320,
    genres: bookData.genres && bookData.genres.length > 0 ? bookData.genres : ["Fiction"],
    averageRating: 4.2,
    ratingsCount: 1,
    ratingDistribution: {
      "0.5": 0,
      "1.0": 0,
      "1.5": 0,
      "2.0": 0,
      "2.5": 0,
      "3.0": 0,
      "3.5": 0,
      "4.0": 1,
      "4.5": 0,
      "5.0": 0,
    },
  });

  return newBook;
}

