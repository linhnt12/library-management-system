import { NextRequest } from 'next/server';
import { BookType, Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { PublicBook, BooksListPayload, CreateBookData } from '@/types/book';
import {
  successResponse,
  errorResponse,
  handleRouteError,
  parsePaginationParams,
  validateRequiredFields,
  sanitizeString,
  parseIntParam,
} from '@/lib/api-utils';

// GET /api/books - Get books
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, search } = parsePaginationParams(searchParams);

    // Optional filters
    const authorIdParam = searchParams.get('authorId');
    const typeParam = searchParams.get('type') as BookType | null;
    const publishYearParam = searchParams.get('publishYear');

    const authorId = authorIdParam ? parseIntParam(authorIdParam, 0) : undefined;
    const publishYear = publishYearParam ? parseIntParam(publishYearParam, 0) : undefined;

    const where: Prisma.BookWhereInput = { isDeleted: false };

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { isbn: { contains: search } },
        { publisher: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (authorId && authorId > 0) {
      where.authorId = authorId;
    }

    if (typeParam) {
      where.type = typeParam;
    }

    if (publishYear && publishYear > 0) {
      where.publishYear = publishYear;
    }

    const skip = (page - 1) * limit;

    const [booksRaw, total] = await Promise.all([
      prisma.book.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          authorId: true,
          title: true,
          isbn: true,
          publishYear: true,
          publisher: true,
          pageCount: true,
          price: true,
          edition: true,
          type: true,
          description: true,
          coverImageUrl: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.book.count({ where }),
    ]);

    const books = booksRaw as unknown as PublicBook[];

    return successResponse<BooksListPayload>({
      books,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleRouteError(error, 'GET /api/books');
  }
}

// POST /api/books - Create book
export async function POST(request: NextRequest) {
  try {
    const body: CreateBookData = await request.json();
    const {
      authorId,
      title,
      isbn,
      publishYear,
      publisher,
      pageCount,
      price,
      edition,
      type,
      description,
      coverImageUrl,
    } = body;

    // Validate required fields
    const validationError = validateRequiredFields(body, ['authorId', 'title']);
    if (validationError) {
      return errorResponse(validationError, 400);
    }

    const authorIdNum =
      typeof authorId === 'string' ? parseIntParam(authorId, 0) : Number(authorId);
    if (!authorIdNum || authorIdNum <= 0) {
      return errorResponse('Invalid authorId', 400);
    }

    // Prepare data
    const data: Prisma.BookUncheckedCreateInput = {
      authorId: authorIdNum,
      title: sanitizeString(title),
      isbn: isbn ? sanitizeString(isbn) : null,
      publishYear: publishYear ? Number(publishYear) : null,
      publisher: publisher ? sanitizeString(publisher) : null,
      pageCount: pageCount ? Number(pageCount) : null,
      price: price ? Number(price) : null,
      edition: edition ? sanitizeString(edition) : null,
      type: type || BookType.PRINT,
      description: description ? sanitizeString(description) : null,
      coverImageUrl: coverImageUrl ? sanitizeString(coverImageUrl) : null,
    };

    const created: PublicBook = await prisma.book.create({
      data,
      select: {
        id: true,
        authorId: true,
        title: true,
        isbn: true,
        publishYear: true,
        publisher: true,
        pageCount: true,
        price: true,
        edition: true,
        type: true,
        description: true,
        coverImageUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return successResponse<PublicBook>(created, 'Book created successfully', 201);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint') || error.message.includes('isbn')) {
        return errorResponse('ISBN already exists', 409);
      }
    }
    return handleRouteError(error, 'POST /api/books');
  }
}
