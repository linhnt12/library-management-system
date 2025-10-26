import { ValidationError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';
import { FileUtils } from '@/lib/server-utils';
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
import path from 'path';

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
    const contentType = request.headers.get('content-type');
    let body: Partial<CreateBookData> = {};
    let bookIdForCover = null;

    // Check if it's multipart/form-data
    if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData();

      // Extract form fields
      const authorId = formData.get('authorId')?.toString();
      const title = formData.get('title')?.toString();
      const isbn = formData.get('isbn')?.toString();
      const publishYear = formData.get('publishYear')?.toString();
      const publisher = formData.get('publisher')?.toString();
      const pageCount = formData.get('pageCount')?.toString();
      const price = formData.get('price')?.toString();
      const edition = formData.get('edition')?.toString();
      const description = formData.get('description')?.toString();
      const isDeleted = formData.get('isDeleted')?.toString();
      const categories = formData.get('categories')?.toString();

      // Build body object
      body = {
        authorId: authorId || '',
        title: title || '',
        isbn: isbn || null,
        publishYear: publishYear || null,
        publisher: publisher || null,
        pageCount: pageCount || null,
        price: price || null,
        edition: edition || null,
        description: description || null,
        coverImageUrl: null,
        isDeleted: isDeleted === 'true',
        categories: categories ? JSON.parse(categories) : [],
      };

      // Handle cover image file upload - need to create book first to get ID
      const coverImageFile = formData.get('coverImage') as File | null;
      if (coverImageFile && coverImageFile.size > 0) {
        // Will handle after book creation
        bookIdForCover = coverImageFile;
      }
    } else {
      // Handle JSON request
      body = await request.json();
    }

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
    const validationError = validateRequiredFields(
      body as CreateBookData & Record<string, unknown>,
      ['authorId', 'title']
    );
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
      title: sanitizeString(title || ''),
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

    // Handle cover image file upload if exists
    if (bookIdForCover && created) {
      const coverImageFile = bookIdForCover as File;

      // Validate file type
      const allowedImageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      const fileExtension = path.extname(coverImageFile.name).toLowerCase();

      if (allowedImageExtensions.includes(fileExtension)) {
        // Check file size (max 5MB)
        const maxImageSize = 5 * 1024 * 1024;
        if (coverImageFile.size <= maxImageSize) {
          // Generate unique filename
          const timestamp = Date.now();
          const sanitizedFileName = `cover-${created.id}-${timestamp}${fileExtension}`;

          // Convert File to Buffer
          const arrayBuffer = await coverImageFile.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          // Write file to uploads/book-covers directory
          const uploadResult = await FileUtils.writeFileToSystem(buffer, sanitizedFileName, {
            directory: 'uploads/book-covers',
            overwrite: true,
            createDirectory: true,
          });

          if (uploadResult.success) {
            // Update book with cover image URL
            const updatedBook = await prisma.book.update({
              where: { id: created.id },
              data: {
                coverImageUrl: `/api/files/uploads/book-covers/${sanitizedFileName}`,
              },
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
            return successResponse<Book>(updatedBook, 'Book created successfully', 201);
          }
        }
      }
    }

    return successResponse<Book>(created, 'Book created successfully', 201);
  } catch (error) {
    return handleRouteError(error, 'POST /api/books');
  }
});
