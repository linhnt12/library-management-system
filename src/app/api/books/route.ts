import { ValidationError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';
import {
  handleRouteError,
  parseIntParam,
  parsePaginationParams,
  sanitizeString,
  successResponse,
  validateRequiredFields,
} from '@/lib/utils';
import { requireLibrarian } from '@/middleware/auth.middleware';
import { Book, BookWithAuthor, BooksListPayload, CreateBookData } from '@/types/book';
import { Prisma } from '@prisma/client';
import { NextRequest } from 'next/server';

// GET /api/books - Get books
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, search } = parsePaginationParams(searchParams);

    // Optional filters
    const authorIdsParam = searchParams.getAll('authorIds');
    const categoryIdsParam = searchParams.getAll('categoryIds');
    const publishYearFromParam = searchParams.get('publishYearFrom');
    const publishYearToParam = searchParams.get('publishYearTo');
    const statusParam = searchParams.get('status');
    const sortBy = searchParams.get('sortBy');
    const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' | null;
    const isDeletedParam = searchParams.get('isDeleted');

    const authorIds =
      authorIdsParam.length > 0
        ? authorIdsParam.map(id => parseIntParam(id, 0)).filter(id => id > 0)
        : [];
    const categoryIds =
      categoryIdsParam.length > 0
        ? categoryIdsParam.map(id => parseIntParam(id, 0)).filter(id => id > 0)
        : [];
    const publishYearFrom = publishYearFromParam
      ? parseIntParam(publishYearFromParam, 0)
      : undefined;
    const publishYearTo = publishYearToParam ? parseIntParam(publishYearToParam, 0) : undefined;

    const where: Prisma.BookWhereInput = {
      ...(isDeletedParam === null || isDeletedParam === 'false' ? { isDeleted: false } : {}),
    };

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { isbn: { contains: search } },
        { publisher: { contains: search } },
        { description: { contains: search } },
        { author: { fullName: { contains: search } } },
      ];
    }

    // Handle author filter
    if (authorIds.length > 0) {
      where.authorId = { in: authorIds };
    }

    // Handle category filter
    if (categoryIds.length > 0) {
      where.bookCategories = {
        some: {
          categoryId: { in: categoryIds },
        },
      };
    }

    // Handle publish year range filter
    if (publishYearFrom && publishYearFrom > 0) {
      where.publishYear = { gte: publishYearFrom };
    }
    if (publishYearTo && publishYearTo > 0) {
      const existingPublishYear = where.publishYear as Prisma.IntFilter | undefined;
      where.publishYear = {
        ...existingPublishYear,
        lte: publishYearTo,
      };
    }

    // TODO: This will be update later
    // Handle status filter
    if (statusParam) {
      // This is a placeholder - adjust based on your actual status field
      // where.status = statusParam;
    }

    const skip = (page - 1) * limit;

    // Build orderBy clause
    let orderBy: Prisma.BookOrderByWithRelationInput = { createdAt: 'desc' };

    if (sortBy && sortOrder) {
      // Map frontend sort keys to database fields
      const sortFieldMap: Record<string, string> = {
        id: 'id',
        title: 'title',
        publishYear: 'publishYear',
        pageCount: 'pageCount',
        price: 'price',
        createdAt: 'createdAt',
      };

      const dbField = sortFieldMap[sortBy];
      if (dbField) {
        orderBy = { [dbField]: sortOrder };
      }
    }

    const [booksRaw, total] = await Promise.all([
      prisma.book.findMany({
        where,
        skip,
        take: limit,
        orderBy,
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
          description: true,
          coverImageUrl: true,
          isDeleted: true,
          createdAt: true,
          updatedAt: true,
          author: {
            select: {
              id: true,
              fullName: true,
            },
          },
          bookCategories: {
            select: {
              category: {
                select: {
                  name: true,
                },
              },
            },
          },
          bookEditions: {
            select: {
              format: true,
              id: true,
            },
          },
          _count: {
            select: {
              bookItems: true,
            },
          },
          reviews: {
            where: {
              isDeleted: false,
            },
            select: {
              rating: true,
            },
          },
        },
      }),
      prisma.book.count({ where }),
    ]);

    const books = (
      booksRaw as (BookWithAuthor & {
        bookCategories?: { category: { name: string } }[];
        bookEditions?: { id: number; format: 'EBOOK' | 'AUDIO' }[];
        _count?: { bookItems: number };
        reviews?: { rating: number }[];
      })[]
    ).map(b => {
      const ebookCount = b.bookEditions?.filter(e => e.format === 'EBOOK').length ?? 0;
      const audioCount = b.bookEditions?.filter(e => e.format === 'AUDIO').length ?? 0;

      // Calculate rating from reviews
      const reviews = b.reviews || [];
      const averageRating =
        reviews.length > 0
          ? Math.round(
              (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length) * 10
            ) / 10
          : 0;

      return {
        ...b,
        categories: b.bookCategories?.map(x => x.category.name) ?? [],
        bookItemsCount: b._count?.bookItems ?? 0,
        bookEbookCount: ebookCount,
        bookAudioCount: audioCount,
        averageRating,
      };
    });

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
export const POST = requireLibrarian(async request => {
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
      description,
      coverImageUrl,
      isDeleted,
      categories,
    } = body;

    // Validate required fields
    const validationError = validateRequiredFields(body as unknown as Record<string, unknown>, [
      'authorId',
      'title',
    ]);
    if (validationError) {
      throw new ValidationError(validationError);
    }

    const authorIdNum =
      typeof authorId === 'string' ? parseIntParam(authorId, 0) : Number(authorId);
    if (!authorIdNum || authorIdNum <= 0) {
      throw new ValidationError('Invalid authorId');
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
      description: description ? sanitizeString(description) : null,
      coverImageUrl: coverImageUrl ? sanitizeString(coverImageUrl) : null,
      isDeleted: Boolean(isDeleted),
      bookCategories:
        categories && categories.length > 0
          ? {
              create: categories.map(categoryId => ({
                categoryId: Number(categoryId),
              })),
            }
          : undefined,
    };

    const created: Book = await prisma.book.create({
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
        description: true,
        coverImageUrl: true,
        isDeleted: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return successResponse<Book>(created, 'Book created successfully', 201);
  } catch (error) {
    return handleRouteError(error, 'POST /api/books');
  }
});
