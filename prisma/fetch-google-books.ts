import * as fs from 'fs';
import * as path from 'path';

// =========================
// API Configuration Constants
// =========================
const GOOGLE_BOOKS_API_BASE_URL = 'https://www.googleapis.com/books/v1/volumes';
const API_KEY = 'AIzaSyCIOEtIzG6orz3OAmi7CThCiPpboCL6-so';
const SEARCH_KEYWORD = 'program';
const START_INDEX = 0;
const MAX_RESULTS = 20;

// =========================
// Type Definitions
// =========================
interface GoogleBooksVolume {
  kind: string;
  id: string;
  etag: string;
  selfLink: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    publishedDate?: string;
    publisher?: string;
    description?: string;
    industryIdentifiers?: Array<{
      type: string;
      identifier: string;
    }>;
    pageCount?: number;
    printType?: string;
    categories?: string[];
    language?: string;
    subtitle?: string;
    imageLinks?: {
      smallThumbnail?: string;
      thumbnail?: string;
    };
  };
}

interface GoogleBooksResponse {
  kind: string;
  totalItems: number;
  items?: GoogleBooksVolume[];
}

interface BookJsonData {
  ISBN: string;
  Title: string;
  Author: string;
  Year: number;
  Publisher: string;
  category: string[]; // Changed back to string[] to support multiple categories
  language: string;
  subtitle?: string;
  description?: string;
}

// =========================
// Helper Functions
// =========================

/**
 * Helper function: Extracts ISBN from industry identifiers (prefers ISBN_13, then ISBN_10, then OTHER)
 */
function extractISBN(industryIdentifiers?: Array<{ type: string; identifier: string }>): string {
  if (!industryIdentifiers || industryIdentifiers.length === 0) {
    return '';
  }

  // Prefer ISBN_13, then ISBN_10, then OTHER
  const isbn13 = industryIdentifiers.find(id => id.type === 'ISBN_13');
  if (isbn13) return isbn13.identifier;

  const isbn10 = industryIdentifiers.find(id => id.type === 'ISBN_10');
  if (isbn10) return isbn10.identifier;

  // Fallback to first identifier if no ISBN found
  return industryIdentifiers[0].identifier;
}

/**
 * Helper function: Extracts year from published date string
 */
function extractYear(publishedDate?: string): number {
  if (!publishedDate) return 0;

  // Try to extract year from various formats: "1997", "1997-01", "1997-01-15"
  const yearMatch = publishedDate.match(/^(\d{4})/);
  if (yearMatch) {
    return parseInt(yearMatch[1], 10);
  }

  return 0;
}

/**
 * Helper function: Gets first author or empty string
 */
function getFirstAuthor(authors?: string[]): string {
  if (!authors || authors.length === 0) {
    return '';
  }
  return authors[0];
}

/**
 * Helper function: Builds category array from categories and printType
 */
function buildCategoryArray(categories?: string[], printType?: string): string[] {
  const categoryArray: string[] = [];

  // Add categories if they exist
  if (categories && categories.length > 0) {
    categoryArray.push(...categories);
  }

  // Add printType if it exists and is not already in the array
  if (printType && !categoryArray.includes(printType)) {
    categoryArray.push(printType);
  }

  return categoryArray;
}

/**
 * Helper function: Transforms Google Books volume to BookJsonData format
 */
function transformVolumeToBookData(volume: GoogleBooksVolume): BookJsonData | null {
  const { volumeInfo } = volume;

  // Skip if missing essential fields
  if (!volumeInfo.title) {
    return null;
  }

  const isbn = extractISBN(volumeInfo.industryIdentifiers);
  const year = extractYear(volumeInfo.publishedDate);
  const author = getFirstAuthor(volumeInfo.authors);
  const category = buildCategoryArray(volumeInfo.categories, volumeInfo.printType);

  return {
    ISBN: isbn,
    Title: volumeInfo.title,
    Author: author,
    Year: year,
    Publisher: volumeInfo.publisher || '',
    category: category,
    language: volumeInfo.language || 'en',
    subtitle: volumeInfo.subtitle || undefined,
    description: volumeInfo.description || undefined,
  };
}

/**
 * Main function: to fetch books from Google Books API
 */
async function fetchBooksFromGoogleAPI(): Promise<BookJsonData[]> {
  const searchParams = new URLSearchParams({
    q: SEARCH_KEYWORD,
    startIndex: START_INDEX.toString(),
    maxResults: MAX_RESULTS.toString(),
    key: API_KEY,
  });

  const url = `${GOOGLE_BOOKS_API_BASE_URL}?${searchParams.toString()}`;
  console.log(`Fetching books from: ${url}`);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: GoogleBooksResponse = await response.json();

    if (!data.items || data.items.length === 0) {
      console.log('No books found in API response');
      return [];
    }

    console.log(`Fetched ${data.items.length} books from API (Total: ${data.totalItems})`);

    // Transform volumes to book data
    const booksData: BookJsonData[] = [];

    for (const volume of data.items) {
      const bookData = transformVolumeToBookData(volume);
      if (bookData) {
        booksData.push(bookData);
      } else {
        console.log(`Skipped volume "${volume.volumeInfo.title}" - missing essential fields`);
      }
    }

    return booksData;
  } catch (error) {
    console.error('Error fetching books from Google Books API:', error);
    throw error;
  }
}

/**
 * Saves books data to JSON file (appends to existing data if file exists)
 */
function saveBooksToJson(booksData: BookJsonData[], outputPath: string): void {
  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`Created output directory: ${outputDir}`);
  }

  // Read existing data if file exists
  let existingData: BookJsonData[] = [];
  if (fs.existsSync(outputPath)) {
    try {
      const existingContent = fs.readFileSync(outputPath, 'utf-8');
      existingData = JSON.parse(existingContent);
      console.log(`Loaded ${existingData.length} existing books from file`);
    } catch (error) {
      console.warn(`Error reading existing file, starting fresh: ${error}`);
      existingData = [];
    }
  }

  // Create a Set of existing ISBNs for duplicate checking
  const existingISBNs = new Set(
    existingData.map(book => book.ISBN).filter(isbn => isbn && isbn.trim() !== '')
  );

  // Filter out duplicates and merge
  const newBooks = booksData.filter(book => {
    // Skip if ISBN exists and is not empty
    if (book.ISBN && book.ISBN.trim() !== '' && existingISBNs.has(book.ISBN)) {
      console.log(`Skipping duplicate book (ISBN: ${book.ISBN}): ${book.Title}`);
      return false;
    }
    return true;
  });

  // Merge existing and new data
  const mergedData = [...existingData, ...newBooks];

  // Save merged data
  const jsonContent = JSON.stringify(mergedData, null, 4);
  fs.writeFileSync(outputPath, jsonContent, 'utf-8');
  console.log(
    `Saved ${mergedData.length} total books (${existingData.length} existing + ${newBooks.length} new) to ${outputPath}`
  );
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('Starting to fetch books from Google Books API...');
    console.log(`Search keyword: "${SEARCH_KEYWORD}"`);
    console.log(`Start index: ${START_INDEX}, Max results: ${MAX_RESULTS}`);

    // Fetch books from API
    const booksData = await fetchBooksFromGoogleAPI();

    if (booksData.length === 0) {
      console.log('No books to save. Exiting.');
      return;
    }

    // Save to JSON file
    const outputPath = path.join(__dirname, 'data-mock', 'google-books.json');
    saveBooksToJson(booksData, outputPath);

    console.log('\nSummary:');
    console.log(`   Fetched from API: ${booksData.length} books`);
    console.log('   (See details above for existing/new books count)');
    console.log('Fetch completed successfully!');
  } catch (error) {
    console.error('Error during fetch:', error);
    throw error;
  }
}

// Run the script
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
