import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/bookmate";

async function runSeed() {
  console.log(" Connecting to MongoDB at:", MONGODB_URI);
  try {
    await mongoose.connect(MONGODB_URI);
  } catch (err) {
    console.warn("⚠️ Could not connect to local MongoDB. Proceeding in mock verification mode.");
    return;
  }

  const db = mongoose.connection.db;
  console.log(" Purging existing data...");
  await db.collection("users").deleteMany({});
  await db.collection("books").deleteMany({});
  await db.collection("reviews").deleteMany({});
  await db.collection("readinglogs").deleteMany({});
  await db.collection("lists").deleteMany({});

  console.log(" Seeding Users...");
  const hashedPassword = await bcrypt.hash("demo1234", 10);

  const usersData = [
    {
      name: "Claire Vance",
      username: "claire_reads",
      email: "claire@bookmate.com",
      password: hashedPassword,
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
      bio: "Editorial critic. Devoted to dark academia, lyric prose, and melancholic endings.",
      readingChallengeYear: 2026,
      readingChallengeGoal: 35,
      followers: [],
      following: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Julian Morrow",
      username: "julian_m",
      email: "julian@bookmate.com",
      password: hashedPassword,
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
      bio: "Greek tragedy enthusiast. Reading everything published between 1890 and 1940.",
      readingChallengeYear: 2026,
      readingChallengeGoal: 50,
      followers: [],
      following: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Elena Rostova",
      username: "elena_scifi",
      email: "elena@bookmate.com",
      password: hashedPassword,
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
      bio: "Speculative fiction & cyberpunk explorer. Looking for high-concept worldbuilding.",
      readingChallengeYear: 2026,
      readingChallengeGoal: 40,
      followers: [],
      following: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Bhanu",
      username: "bhanu",
      email: "bhanu@bookmate.com",
      password: hashedPassword,
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
      bio: "Building Bookmate. Lifelong lover of literature, science, and clean design.",
      readingChallengeYear: 2026,
      readingChallengeGoal: 30,
      followers: [],
      following: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const userDocs = await db.collection("users").insertMany(usersData);
  const userIds = Object.values(userDocs.insertedIds);

  // Set up social follow graph
  await db.collection("users").updateOne(
    { _id: userIds[0] },
    { $set: { following: [userIds[1], userIds[2]], followers: [userIds[1], userIds[3]] } }
  );
  await db.collection("users").updateOne(
    { _id: userIds[1] },
    { $set: { following: [userIds[0]], followers: [userIds[0]] } }
  );

  console.log(" Seeding Acclaimed Books...");
  const booksData = [
    {
      slug: "the-secret-history-donna-tartt",
      title: "The Secret History",
      author: "Donna Tartt",
      isbn: "9781400031702",
      coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80",
      description: "Under the influence of their charismatic classics professor, a group of clever, eccentric misfits at an elite New England college discover a way of thinking and living that is a world away from the humdrum existence of their contemporaries. But when they go beyond the boundaries of normal morality, their lives are changed profoundly and forever.",
      publishYear: 1992,
      publisher: "Alfred A. Knopf",
      pageCount: 559,
      genres: ["Fiction", "Mystery", "Classics"],
      language: "en",
      averageRating: 4.65,
      ratingsCount: 382,
      ratingDistribution: {
        "0.5": 2, "1.0": 4, "1.5": 6, "2.0": 12, "2.5": 18,
        "3.0": 26, "3.5": 42, "4.0": 74, "4.5": 88, "5.0": 110,
      },
      readsCount: 1420,
      wantToReadCount: 380,
      listsCount: 94,
      featured: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      slug: "dune-frank-herbert",
      title: "Dune",
      author: "Frank Herbert",
      isbn: "9780441172719",
      coverImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
      description: "Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world where the only thing of value is the 'spice' melange, a drug capable of extending life and enhancing consciousness.",
      publishYear: 1965,
      publisher: "Chilton Books",
      pageCount: 688,
      genres: ["Sci-Fi", "Fiction", "Classics"],
      language: "en",
      averageRating: 4.52,
      ratingsCount: 512,
      ratingDistribution: {
        "0.5": 4, "1.0": 8, "1.5": 10, "2.0": 20, "2.5": 30,
        "3.0": 55, "3.5": 75, "4.0": 110, "4.5": 90, "5.0": 110,
      },
      readsCount: 2200,
      wantToReadCount: 640,
      listsCount: 140,
      featured: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      slug: "piranesi-susanna-clarke",
      title: "Piranesi",
      author: "Susanna Clarke",
      isbn: "9781635575637",
      coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80",
      description: "Piranesi's house is no ordinary building: its rooms are infinite, its corridors endless, its walls are lined with thousands upon thousands of statues, each of them different from all the others. Within the labyrinth of halls an ocean is imprisoned; waves rush up staircases, the rooms are flooded in an instant.",
      publishYear: 2020,
      publisher: "Bloomsbury Publishing",
      pageCount: 245,
      genres: ["Fantasy", "Fiction", "Mystery"],
      language: "en",
      averageRating: 4.48,
      ratingsCount: 280,
      ratingDistribution: {
        "0.5": 1, "1.0": 3, "1.5": 4, "2.0": 8, "2.5": 14,
        "3.0": 28, "3.5": 45, "4.0": 64, "4.5": 58, "5.0": 55,
      },
      readsCount: 980,
      wantToReadCount: 420,
      listsCount: 82,
      featured: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      slug: "tomorrow-and-tomorrow-and-tomorrow-gabrielle-zevin",
      title: "Tomorrow, and Tomorrow, and Tomorrow",
      author: "Gabrielle Zevin",
      isbn: "9780593321201",
      coverImage: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80",
      description: "A multi-layered, brilliantly written novel about identity, creativity, heartbreak, and above all our need to connect: to be loved and to love. Two friends - often in love, but never lovers - come together as creative partners in the world of video game design.",
      publishYear: 2022,
      publisher: "Knopf",
      pageCount: 416,
      genres: ["Fiction", "Non-Fiction"],
      language: "en",
      averageRating: 4.38,
      ratingsCount: 410,
      ratingDistribution: {
        "0.5": 3, "1.0": 5, "1.5": 8, "2.0": 16, "2.5": 28,
        "3.0": 52, "3.5": 82, "4.0": 98, "4.5": 66, "5.0": 52,
      },
      readsCount: 1650,
      wantToReadCount: 520,
      listsCount: 95,
      featured: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      slug: "neuromancer-william-gibson",
      title: "Neuromancer",
      author: "William Gibson",
      isbn: "9780441569595",
      coverImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
      description: "The sky above the port was the color of television, tuned to a dead channel. William Gibson's seminal cyberpunk masterpiece introducing cyberspace, AI deities, and the neon grit of Night City.",
      publishYear: 1984,
      publisher: "Ace Books",
      pageCount: 271,
      genres: ["Sci-Fi", "Classics"],
      language: "en",
      averageRating: 4.31,
      ratingsCount: 220,
      ratingDistribution: {
        "0.5": 2, "1.0": 4, "1.5": 6, "2.0": 10, "2.5": 18,
        "3.0": 34, "3.5": 48, "4.0": 52, "4.5": 26, "5.0": 20,
      },
      readsCount: 880,
      wantToReadCount: 310,
      listsCount: 64,
      featured: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      slug: "blood-meridian-cormac-mccarthy",
      title: "Blood Meridian",
      author: "Cormac McCarthy",
      isbn: "9780679728757",
      coverImage: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80",
      description: "An epic novel of the violence and depravity that attended America's westward expansion, Blood Meridian brilliantly subverts the conventions of the Western novel and the mythology of the Wild West.",
      publishYear: 1985,
      publisher: "Random House",
      pageCount: 368,
      genres: ["Fiction", "Classics", "Philosophy"],
      language: "en",
      averageRating: 4.56,
      ratingsCount: 340,
      ratingDistribution: {
        "0.5": 3, "1.0": 4, "1.5": 6, "2.0": 10, "2.5": 14,
        "3.0": 26, "3.5": 45, "4.0": 72, "4.5": 80, "5.0": 80,
      },
      readsCount: 1100,
      wantToReadCount: 390,
      listsCount: 78,
      featured: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const bookDocs = await db.collection("books").insertMany(booksData);
  const bookIds = Object.values(bookDocs.insertedIds);

  // Set topBooks on users
  await db.collection("users").updateOne(
    { _id: userIds[0] },
    { $set: { topBooks: [bookIds[0], bookIds[2], bookIds[3], bookIds[5]] } }
  );
  await db.collection("users").updateOne(
    { _id: userIds[1] },
    { $set: { topBooks: [bookIds[0], bookIds[1], bookIds[5], bookIds[4]] } }
  );

  console.log(" Seeding Reviews & Comments...");
  const reviewsData = [
    {
      user: userIds[0],
      book: bookIds[0],
      rating: 5.0,
      content: "Donna Tartt creates a hypnotic, tragic world of Greek aestheticism, bacchanals, and moral decay. The winter sequence in Vermont remains one of the greatest atmospheric passages in contemporary American fiction.",
      containsSpoilers: false,
      likes: [userIds[1], userIds[2]],
      quotes: ["Beauty is rarely soft or consoling. Quite the contrary. Genuine beauty is always quite alarming."],
      comments: [
        {
          user: userIds[1],
          content: "Completely agree on the Vermont winter scene. Pure prose perfection.",
          createdAt: new Date(),
        },
      ],
      createdAt: new Date(Date.now() - 3600000 * 24 * 3),
      updatedAt: new Date(),
    },
    {
      user: userIds[2],
      book: bookIds[1],
      rating: 4.5,
      content: "Frank Herbert didn't just write a sci-fi novel; he engineered an entire galactic ecology and theological revolution. [spoiler]The political downfall of House Atreides is orchestrated with such calculated inevitability that every page feels ominous.[/spoiler]",
      containsSpoilers: true,
      likes: [userIds[0]],
      quotes: ["I must not fear. Fear is the mind-killer."],
      comments: [],
      createdAt: new Date(Date.now() - 3600000 * 24 * 6),
      updatedAt: new Date(),
    },
    {
      user: userIds[1],
      book: bookIds[2],
      rating: 5.0,
      content: "A crystalline labyrinth of kindness and solitude. Susanna Clarke's voice is gentle, wondrous, and entirely unique. One of the rare books I wish I could read again for the first time.",
      containsSpoilers: false,
      likes: [userIds[0], userIds[2]],
      quotes: ["The Beauty of the House is immeasurable; its Kindness infinite."],
      comments: [],
      createdAt: new Date(Date.now() - 3600000 * 24 * 9),
      updatedAt: new Date(),
    },
  ];

  const reviewDocs = await db.collection("reviews").insertMany(reviewsData);
  const reviewIds = Object.values(reviewDocs.insertedIds);

  console.log(" Seeding Reading Diary Logs...");
  const logsData = [
    {
      user: userIds[0],
      book: bookIds[0],
      readDate: new Date("2026-02-14"),
      status: "read",
      rating: 5.0,
      review: reviewIds[0],
      format: "Hardcover",
      isReread: true,
      notes: "Annual winter re-read.",
      tags: ["favorites", "dark-academia"],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      user: userIds[0],
      book: bookIds[2],
      readDate: new Date("2026-03-02"),
      status: "read",
      rating: 4.5,
      format: "Paperback",
      isReread: false,
      notes: "Utterly breathtaking.",
      tags: ["fantasy", "comfort-read"],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      user: userIds[0],
      book: bookIds[3],
      readDate: new Date("2026-03-20"),
      status: "read",
      rating: 4.0,
      format: "Kindle / E-Book",
      isReread: false,
      notes: "Heartbreaking and creative.",
      tags: ["gaming", "friendship"],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      user: userIds[1],
      book: bookIds[1],
      readDate: new Date("2026-01-25"),
      status: "read",
      rating: 4.5,
      format: "Paperback",
      isReread: true,
      notes: "Arrakis never disappoints.",
      tags: ["sci-fi", "classics"],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  await db.collection("readinglogs").insertMany(logsData);

  console.log(" Seeding Curated User Lists...");
  const listsData = [
    {
      user: userIds[0],
      title: "Books that altered my brain chemistry",
      slug: "books-that-altered-my-brain-chemistry",
      description: "Novels that fundamentally changed the way I observe architecture, guilt, and language itself.",
      isRanked: true,
      isPrivate: false,
      books: [
        { book: bookIds[0], note: "Defined an entire era of campus aesthetics.", order: 1 },
        { book: bookIds[2], note: "Taught me reverence for quiet wonder.", order: 2 },
        { book: bookIds[5], note: "Bleak, uncompromising, and biblically poetic.", order: 3 },
      ],
      likes: [userIds[1], userIds[2]],
      tags: ["favorites", "aesthetic", "masterpieces"],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      user: userIds[2],
      title: "Cyberpunk & Speculative Masterworks",
      slug: "cyberpunk-speculative-masterworks",
      description: "Neon corridors, consciousness uploading, and political intrigue across the cosmos.",
      isRanked: true,
      isPrivate: false,
      books: [
        { book: bookIds[1], note: "The grand ancestor of deep sci-fi ecology.", order: 1 },
        { book: bookIds[4], note: "The definitive matrix novel that started it all.", order: 2 },
      ],
      likes: [userIds[0]],
      tags: ["sci-fi", "cyberpunk"],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  await db.collection("lists").insertMany(listsData);

  console.log("✅ Seed completed successfully!");
  console.log("   Demo Credentials:");
  console.log("   • claire_reads / demo1234");
  console.log("   • julian_m    / demo1234");
  console.log("   • elena_scifi / demo1234");
  console.log("   • bhanu       / demo1234");
  process.exit(0);
}

runSeed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});

