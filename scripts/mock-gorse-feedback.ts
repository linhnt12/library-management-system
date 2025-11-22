/**
 * Script to mock feedback directly into Gorse database
 *
 * This script:
 * 1. Gets users from library database (READER role only)
 * 2. Gets books from library database
 * 3. Creates mock feedback directly in Gorse database
 * 4. Feedback types: "star", "like", "comment", "borrow", "reserve", "view", "read"
 */

import { PrismaClient, Role } from '@prisma/client';
import 'dotenv/config';
import mysql from 'mysql2/promise';

const prisma = new PrismaClient();

// Gorse database connection
const gorseDbConfig = {
  host: process.env.GORSE_MYSQL_HOST || 'localhost',
  port: parseInt(process.env.GORSE_MYSQL_PORT || '3307'),
  user: process.env.GORSE_MYSQL_USER || 'gorse_user',
  password: process.env.GORSE_MYSQL_PASSWORD || 'gorse123',
  database: process.env.GORSE_MYSQL_DATABASE || 'gorse_db',
  multipleStatements: true,
};

// Feedback types available
type FeedbackType = 'star' | 'like' | 'comment' | 'borrow' | 'reserve' | 'view' | 'read';

// Configuration
const FEEDBACK_PER_USER_MIN = 5; // Minimum feedback per user
const FEEDBACK_PER_USER_MAX = 30; // Maximum feedback per user

// Sample comments for "comment" feedback
const SAMPLE_COMMENTS = [
  'Great book! Highly recommend.',
  'Interesting read, enjoyed it very much.',
  'Well written and engaging.',
  'A must-read for anyone interested in this topic.',
  'Excellent content, learned a lot.',
  'Really enjoyed this book.',
  'Good book, worth reading.',
  'Interesting perspective on the subject.',
  'Well researched and informative.',
  'Enjoyable read from start to finish.',
  'Highly recommended!',
  'Great storytelling and narrative.',
  'Thought-provoking and insightful.',
  'Well-structured and easy to follow.',
  'Excellent book, would read again.',
];

/**
 * Generate random date within the last year
 */
function generateRandomDate(): Date {
  const now = new Date();
  const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
  const randomTime = oneYearAgo.getTime() + Math.random() * (now.getTime() - oneYearAgo.getTime());
  return new Date(randomTime);
}

/**
 * Generate random comment for "comment" feedback
 */
function generateRandomComment(): string {
  return SAMPLE_COMMENTS[Math.floor(Math.random() * SAMPLE_COMMENTS.length)];
}

/**
 * Mock feedback for a single user
 */
async function mockFeedbackForUser(
  connection: mysql.Connection,
  userId: number,
  gorseUserId: string,
  bookIds: number[]
): Promise<{
  star: number;
  like: number;
  comment: number;
  borrow: number;
  reserve: number;
  view: number;
  read: number;
}> {
  const counts = {
    star: 0,
    like: 0,
    comment: 0,
    borrow: 0,
    reserve: 0,
    view: 0,
    read: 0,
  };

  // Determine how many feedback this user will have
  const numFeedback = Math.floor(
    Math.random() * (FEEDBACK_PER_USER_MAX - FEEDBACK_PER_USER_MIN + 1) + FEEDBACK_PER_USER_MIN
  );

  // Randomly select books for this user (avoid duplicates)
  const selectedBookIds = [...bookIds]
    .sort(() => 0.5 - Math.random())
    .slice(0, Math.min(numFeedback, bookIds.length));

  // Create a set to track which (user_id, item_id, feedback_type) combinations we've used
  const usedCombinations = new Set<string>();

  for (const bookId of selectedBookIds) {
    const itemId = `book_${bookId}`;
    const timeStamp = generateRandomDate();

    // Randomly decide which feedback types to create for this book
    // A user can have multiple feedback types for the same book

    // "view" - most common, users view many books
    if (Math.random() < 0.7) {
      const key = `${gorseUserId}_${itemId}_view`;
      if (!usedCombinations.has(key)) {
        try {
          await connection.execute(
            `INSERT IGNORE INTO feedback (feedback_type, user_id, item_id, time_stamp, comment)
             VALUES (?, ?, ?, ?, ?)`,
            ['view', gorseUserId, itemId, timeStamp, '']
          );
          counts.view++;
          usedCombinations.add(key);
        } catch {
          // Ignore duplicate errors
        }
      }
    }

    // "like" - users like some books they view
    if (Math.random() < 0.4) {
      const key = `${gorseUserId}_${itemId}_like`;
      if (!usedCombinations.has(key)) {
        try {
          await connection.execute(
            `INSERT IGNORE INTO feedback (feedback_type, user_id, item_id, time_stamp, comment)
             VALUES (?, ?, ?, ?, ?)`,
            ['like', gorseUserId, itemId, timeStamp, '']
          );
          counts.like++;
          usedCombinations.add(key);
        } catch {
          // Ignore duplicate errors
        }
      }
    }

    // "reserve" - users reserve books they're interested in
    if (Math.random() < 0.3) {
      const key = `${gorseUserId}_${itemId}_reserve`;
      if (!usedCombinations.has(key)) {
        try {
          await connection.execute(
            `INSERT IGNORE INTO feedback (feedback_type, user_id, item_id, time_stamp, comment)
             VALUES (?, ?, ?, ?, ?)`,
            ['reserve', gorseUserId, itemId, timeStamp, '']
          );
          counts.reserve++;
          usedCombinations.add(key);
        } catch {
          // Ignore duplicate errors
        }
      }
    }

    // "borrow" - users borrow books they reserved or liked
    if (Math.random() < 0.25) {
      const key = `${gorseUserId}_${itemId}_borrow`;
      if (!usedCombinations.has(key)) {
        try {
          await connection.execute(
            `INSERT IGNORE INTO feedback (feedback_type, user_id, item_id, time_stamp, comment)
             VALUES (?, ?, ?, ?, ?)`,
            ['borrow', gorseUserId, itemId, timeStamp, '']
          );
          counts.borrow++;
          usedCombinations.add(key);
        } catch {
          // Ignore duplicate errors
        }
      }
    }

    // "read" - users read books they borrowed
    if (Math.random() < 0.2) {
      const key = `${gorseUserId}_${itemId}_read`;
      if (!usedCombinations.has(key)) {
        try {
          await connection.execute(
            `INSERT IGNORE INTO feedback (feedback_type, user_id, item_id, time_stamp, comment)
             VALUES (?, ?, ?, ?, ?)`,
            ['read', gorseUserId, itemId, timeStamp, '']
          );
          counts.read++;
          usedCombinations.add(key);
        } catch {
          // Ignore duplicate errors
        }
      }
    }

    // "star" - users rate books they read (only 4-5 stars)
    if (Math.random() < 0.15) {
      const key = `${gorseUserId}_${itemId}_star`;
      if (!usedCombinations.has(key)) {
        try {
          await connection.execute(
            `INSERT IGNORE INTO feedback (feedback_type, user_id, item_id, time_stamp, comment)
             VALUES (?, ?, ?, ?, ?)`,
            ['star', gorseUserId, itemId, timeStamp, '']
          );
          counts.star++;
          usedCombinations.add(key);
        } catch {
          // Ignore duplicate errors
        }
      }
    }

    // "comment" - users comment on books they read and liked
    if (Math.random() < 0.1) {
      const key = `${gorseUserId}_${itemId}_comment`;
      if (!usedCombinations.has(key)) {
        try {
          const comment = generateRandomComment();
          await connection.execute(
            `INSERT IGNORE INTO feedback (feedback_type, user_id, item_id, time_stamp, comment)
             VALUES (?, ?, ?, ?, ?)`,
            ['comment', gorseUserId, itemId, timeStamp, comment]
          );
          counts.comment++;
          usedCombinations.add(key);
        } catch {
          // Ignore duplicate errors
        }
      }
    }
  }

  return counts;
}

/**
 * Main function to mock feedback
 */
async function mockFeedback() {
  console.log('Starting to mock feedback into Gorse database...\n');

  // Test Gorse database connection
  const connection = await mysql.createConnection(gorseDbConfig);
  try {
    await connection.ping();
    console.log('Connected to Gorse database\n');
  } catch (error) {
    console.error('Failed to connect to Gorse database:', error);
    throw error;
  }

  // Get users from library database (READER role only)
  console.log('Fetching users from library database...');
  const users = await prisma.user.findMany({
    where: {
      isDeleted: false,
      role: Role.READER,
    },
    select: {
      id: true,
      fullName: true,
    },
  });

  if (users.length === 0) {
    console.log('No users found in library database. Please seed users first.');
    await connection.end();
    return;
  }

  console.log(`Found ${users.length} users\n`);

  // Get books from library database
  console.log('Fetching books from library database...');
  const books = await prisma.book.findMany({
    where: {
      isDeleted: false,
    },
    select: {
      id: true,
    },
  });

  if (books.length === 0) {
    console.log('No books found in library database. Please seed books first.');
    await connection.end();
    return;
  }

  console.log(`Found ${books.length} books\n`);

  const bookIds = books.map(b => b.id);

  // Mock feedback for each user
  console.log('Creating mock feedback...\n');
  const totalCounts = {
    star: 0,
    like: 0,
    comment: 0,
    borrow: 0,
    reserve: 0,
    view: 0,
    read: 0,
  };

  const BATCH_SIZE = 50; // Process users in batches
  let processedUsers = 0;

  for (let i = 0; i < users.length; i += BATCH_SIZE) {
    const batch = users.slice(i, i + BATCH_SIZE);

    for (const user of batch) {
      const gorseUserId = `user_${user.id}`;
      const counts = await mockFeedbackForUser(connection, user.id, gorseUserId, bookIds);

      // Add to totals
      Object.keys(counts).forEach(key => {
        totalCounts[key as FeedbackType] += counts[key as FeedbackType];
      });

      processedUsers++;
      if (processedUsers % 100 === 0) {
        console.log(`Processed ${processedUsers}/${users.length} users...`);
      }
    }

    // Small delay between batches
    if (i + BATCH_SIZE < users.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  await connection.end();

  // Get final count from database
  const finalConnection = await mysql.createConnection(gorseDbConfig);
  const [result] = await finalConnection.execute('SELECT COUNT(*) as total FROM feedback');
  const totalFeedback =
    Array.isArray(result) && result.length > 0 ? (result[0] as { total: number }).total : 0;
  await finalConnection.end();

  console.log('\n Mock feedback completed successfully!\n');
  console.log('=== Summary ===');
  console.log(`   Total users processed: ${users.length}`);
  console.log(`   Total books available: ${books.length}`);
  console.log(`   Total feedback created: ${totalFeedback}`);
  console.log('\n   Feedback breakdown:');
  console.log(`   - "view": ${totalCounts.view}`);
  console.log(`   - "like": ${totalCounts.like}`);
  console.log(`   - "reserve": ${totalCounts.reserve}`);
  console.log(`   - "borrow": ${totalCounts.borrow}`);
  console.log(`   - "read": ${totalCounts.read}`);
  console.log(`   - "star": ${totalCounts.star}`);
  console.log(`   - "comment": ${totalCounts.comment}`);
  console.log('\nNext steps:');
  console.log('   1. Restart Gorse: docker compose restart gorse');
  console.log('   2. Check Gorse dashboard to see the feedback data');
  console.log('   3. Wait for Gorse to process the feedback and generate recommendations');
}

/**
 * Main function
 */
async function main() {
  try {
    await mockFeedback();
  } catch (error) {
    console.error('Error mocking feedback:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
