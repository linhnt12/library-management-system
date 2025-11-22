import * as fs from 'fs';
import * as path from 'path';

// =========================
// API Configuration Constants
// =========================
const GOOGLE_BOOKS_API_BASE_URL = 'https://www.googleapis.com/books/v1/volumes';
const API_KEY = 'AIzaSyCIOEtIzG6orz3OAmi7CThCiPpboCL6-so';
const SEARCH_KEYWORDS = ['program', 'computer', 'technology', 'science', 'engineering']; // Array of search keywords
const MAX_RESULTS = 20;
const MIN_START_INDEX = 0;
const MAX_START_INDEX = 200;
const START_INDEX_STEP = 20;
const DELAY_BETWEEN_REQUESTS_MS = 500; // Delay 500ms between requests to avoid rate limiting

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
  coverImageUrl?: string;
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
 * Helper function: Extracts image URL from imageLinks (prefers thumbnail, then smallThumbnail)
 */
function extractImageUrl(imageLinks?: {
  smallThumbnail?: string;
  thumbnail?: string;
}): string | undefined {
  if (!imageLinks) {
    return undefined;
  }

  // Prefer thumbnail, then smallThumbnail
  if (imageLinks.thumbnail) {
    return imageLinks.thumbnail;
  }

  if (imageLinks.smallThumbnail) {
    return imageLinks.smallThumbnail;
  }

  return undefined;
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
  const coverImageUrl = extractImageUrl(volumeInfo.imageLinks);

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
    coverImageUrl: coverImageUrl,
  };
}

/**
 * Helper function: Delay execution for specified milliseconds
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main function: to fetch books from Google Books API with specific keyword and startIndex
 */
async function fetchBooksFromGoogleAPI(
  keyword: string,
  startIndex: number
): Promise<BookJsonData[]> {
  const searchParams = new URLSearchParams({
    q: keyword,
    startIndex: startIndex.toString(),
    maxResults: MAX_RESULTS.toString(),
    key: API_KEY,
  });

  const url = `${GOOGLE_BOOKS_API_BASE_URL}?${searchParams.toString()}`;
  console.log(`Fetching books from: ${url} (keyword: "${keyword}", startIndex: ${startIndex})`);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: GoogleBooksResponse = await response.json();

    if (!data.items || data.items.length === 0) {
      console.log(
        `No books found in API response for keyword: "${keyword}", startIndex: ${startIndex}`
      );
      return [];
    }

    console.log(
      `Fetched ${data.items.length} books from API (keyword: "${keyword}", startIndex: ${startIndex}, Total available: ${data.totalItems})`
    );

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
    console.error(
      `Error fetching books from Google Books API (keyword: "${keyword}", startIndex: ${startIndex}):`,
      error
    );
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
    console.log(`Search keywords: ${SEARCH_KEYWORDS.map(k => `"${k}"`).join(', ')}`);
    console.log(
      `Start index range: ${MIN_START_INDEX} to ${MAX_START_INDEX} (step: ${START_INDEX_STEP})`
    );
    console.log(`Max results per request: ${MAX_RESULTS}`);
    console.log(`Delay between requests: ${DELAY_BETWEEN_REQUESTS_MS}ms\n`);

    // Collect all books from all requests
    const allBooksData: BookJsonData[] = [];
    const requestsPerKeyword =
      Math.floor((MAX_START_INDEX - MIN_START_INDEX) / START_INDEX_STEP) + 1;
    const totalRequests = SEARCH_KEYWORDS.length * requestsPerKeyword;
    let globalRequestCounter = 0;

    // Loop through each keyword
    for (let keywordIndex = 0; keywordIndex < SEARCH_KEYWORDS.length; keywordIndex++) {
      const keyword = SEARCH_KEYWORDS[keywordIndex];
      console.log(
        `\n${'='.repeat(60)}\n[Keyword ${keywordIndex + 1}/${SEARCH_KEYWORDS.length}] Processing keyword: "${keyword}"\n${'='.repeat(60)}`
      );

      // Loop through startIndex from 0 to 200 with step 20 for each keyword
      for (
        let startIndex = MIN_START_INDEX;
        startIndex <= MAX_START_INDEX;
        startIndex += START_INDEX_STEP
      ) {
        globalRequestCounter++;
        const currentRequest = Math.floor((startIndex - MIN_START_INDEX) / START_INDEX_STEP) + 1;
        console.log(
          `\n[Request ${globalRequestCounter}/${totalRequests}] Keyword: "${keyword}" | startIndex: ${startIndex} (${currentRequest}/${requestsPerKeyword} for this keyword)`
        );

        try {
          // Fetch books from API with current keyword and startIndex
          const booksData = await fetchBooksFromGoogleAPI(keyword, startIndex);

          if (booksData.length > 0) {
            allBooksData.push(...booksData);
            console.log(
              `Added ${booksData.length} books. Total collected so far: ${allBooksData.length}`
            );
          } else {
            console.log(`No books returned for keyword: "${keyword}", startIndex: ${startIndex}`);
          }

          // Add delay between requests to avoid rate limiting (except for the last request of the last keyword)
          if (globalRequestCounter < totalRequests) {
            await delay(DELAY_BETWEEN_REQUESTS_MS);
          }
        } catch (error) {
          console.error(
            `Error fetching books for keyword: "${keyword}", startIndex: ${startIndex}:`,
            error
          );
          // Continue with next request instead of stopping
          console.log('Continuing with next request...');
        }
      }

      // Add a longer delay between keywords to avoid rate limiting
      if (keywordIndex < SEARCH_KEYWORDS.length - 1) {
        console.log(`\nCompleted keyword "${keyword}". Waiting before next keyword...`);
        await delay(DELAY_BETWEEN_REQUESTS_MS * 2); // 2x delay between keywords
      }
    }

    if (allBooksData.length === 0) {
      console.log('\nNo books to save. Exiting.');
      return;
    }

    // Save all collected books to JSON file
    const outputPath = path.join(__dirname, 'data-mock', 'google-books.json');
    saveBooksToJson(allBooksData, outputPath);

    console.log('\n=== Summary ===');
    console.log(`   Total keywords processed: ${SEARCH_KEYWORDS.length}`);
    console.log(`   Total requests made: ${totalRequests}`);
    console.log(`   Total books fetched: ${allBooksData.length}`);
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
