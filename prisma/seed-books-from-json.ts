import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface BookJsonData {
  ISBN: string;
  Title: string;
  Author: string;
  Year: number;
  Publisher: string;
  category: string;
  language: string;
  topic: string[];
}

/**
 * Tìm hoặc tạo Author dựa trên tên (sử dụng cache)
 */
async function findOrCreateAuthor(
  authorName: string,
  authorsCache: Map<string, { id: number; fullName: string }>
) {
  const cacheKey = authorName.toLowerCase();
  const cachedAuthor = authorsCache.get(cacheKey);

  if (cachedAuthor) {
    return cachedAuthor;
  }

  // Tạo author mới nếu không tìm thấy trong cache
  const newAuthor = await prisma.author.create({
    data: {
      fullName: authorName,
      bio: null,
      birthDate: null,
      nationality: null,
    },
    select: { id: true, fullName: true },
  });

  // Thêm vào cache
  authorsCache.set(cacheKey, newAuthor);
  console.log(`Created new author: ${authorName}`);
  return newAuthor;
}

/**
 * Tìm hoặc tạo Category dựa trên tên (sử dụng cache)
 */
async function findOrCreateCategory(
  categoryName: string,
  categoriesCache: Map<string, { id: number; name: string }>
) {
  const cacheKey = categoryName.toLowerCase();
  const cachedCategory = categoriesCache.get(cacheKey);

  if (cachedCategory) {
    return cachedCategory;
  }

  // Tạo category mới nếu không tìm thấy trong cache
  const newCategory = await prisma.category.create({
    data: {
      name: categoryName,
      description: `Category for ${categoryName}`,
    },
    select: { id: true, name: true },
  });

  // Thêm vào cache
  categoriesCache.set(cacheKey, newCategory);
  console.log(`Created new category: ${categoryName}`);
  return newCategory;
}

/**
 * Seed books từ file JSON
 */
async function seedBooksFromJson() {
  console.log('Starting to seed books from books.json...');

  // Đọc file JSON
  const jsonPath = path.join(__dirname, 'data-mock', 'books.json');
  const jsonData = fs.readFileSync(jsonPath, 'utf-8');
  const booksData: BookJsonData[] = JSON.parse(jsonData);

  console.log(`Found ${booksData.length} books in JSON file`);

  // Cache authors và categories để tránh query nhiều lần
  const authorsCache = new Map<string, { id: number; fullName: string }>();
  const categoriesCache = new Map<string, { id: number; name: string }>();

  // Load tất cả authors và categories vào cache
  const allAuthors = await prisma.author.findMany({
    where: { isDeleted: false },
    select: { id: true, fullName: true },
  });
  allAuthors.forEach(author => {
    authorsCache.set(author.fullName.toLowerCase(), author);
  });

  const allCategories = await prisma.category.findMany({
    where: { isDeleted: false },
    select: { id: true, name: true },
  });
  allCategories.forEach(category => {
    categoriesCache.set(category.name.toLowerCase(), category);
  });

  let createdCount = 0;
  let skippedCount = 0;

  for (const bookData of booksData) {
    try {
      // Kiểm tra xem book đã tồn tại chưa (theo ISBN)
      if (bookData.ISBN) {
        const existingBook = await prisma.book.findFirst({
          where: {
            isbn: bookData.ISBN,
            isDeleted: false,
          },
        });

        if (existingBook) {
          console.log(
            `Skipping book "${bookData.Title}" - already exists (ISBN: ${bookData.ISBN})`
          );
          skippedCount++;
          continue;
        }
      }

      // Tìm hoặc tạo Author
      const author = await findOrCreateAuthor(bookData.Author, authorsCache);

      // Tìm hoặc tạo Category
      const category = await findOrCreateCategory(bookData.category, categoriesCache);

      // Chuyển đổi topic array thành JSON string để lưu vào database
      const topicString =
        bookData.topic && bookData.topic.length > 0 ? JSON.stringify(bookData.topic) : null;

      // Tạo Book với đầy đủ các field bao gồm language và topic
      const book = await prisma.book.create({
        data: {
          authorId: author.id,
          title: bookData.Title,
          isbn: bookData.ISBN || null,
          publishYear: bookData.Year || null,
          publisher: bookData.Publisher || null,
          language: bookData.language || null,
          topic: topicString,
          description: null,
          coverImageUrl: null,
          pageCount: null,
          price: null,
          edition: null,
        },
      });

      // Tạo BookCategory để liên kết Book với Category
      await prisma.bookCategory.create({
        data: {
          bookId: book.id,
          categoryId: category.id,
        },
      });

      createdCount++;
      console.log(`Created book: "${bookData.Title}" by ${bookData.Author}`);
    } catch (error) {
      console.error(`Error creating book "${bookData.Title}":`, error);
    }
  }

  console.log('\nSummary:');
  console.log(`   Created: ${createdCount} books`);
  console.log(`   Skipped: ${skippedCount} books`);
  console.log('Books seeding completed!');
}

async function main() {
  try {
    await seedBooksFromJson();
  } catch (error) {
    console.error('Error during seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
