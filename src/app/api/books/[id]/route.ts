import { NotFoundError, ValidationError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';
import { FileUtils } from '@/lib/server-utils';
import { handleRouteError, parseIntParam, sanitizeString, successResponse } from '@/lib/utils';
import { requireLibrarian } from '@/middleware/auth.middleware';
import { Book, BookDetail, UpdateBookData } from '@/types/book';
import { Prisma } from '@prisma/client';
import { NextRequest } from 'next/server';
import path from 'path';

// GET /api/books/[id] - Get book by id
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const bookId = parseIntParam(id);

    if (bookId <= 0) {
      throw new ValidationError('Invalid book ID');
    }

    const book = await prisma.book.findFirst({
      where: { id: bookId },
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
        createdAt: true,
        updatedAt: true,
        isDeleted: true,
        author: {
          select: {
            id: true,
            fullName: true,
          },
        },
        bookItems: {
          where: { isDeleted: false },
          select: {
            id: true,
            code: true,
            condition: true,
            status: true,
            acquisitionDate: true,
            createdAt: true,
            updatedAt: true,
            isDeleted: true,
          },
        },
        bookCategories: {
          where: { isDeleted: false },
          select: {
            categoryId: true,
          },
        },
      },
    });

    if (!book) {
      throw new NotFoundError('Book not found');
    }

    return successResponse<BookDetail>(book);
  } catch (error) {
    return handleRouteError(error, 'GET /api/books/[id]');
  }
}

// PUT /api/books/[id] - Update book
export const PUT = requireLibrarian(async (request, context) => {
  const { params } = context as { params: Promise<{ id: string }> };
  try {
    const { id } = await params;
    const bookId = parseIntParam(id);

    if (bookId <= 0) {
      throw new ValidationError('Invalid book ID');
    }

    const contentType = request.headers.get('content-type');
    let body: Partial<UpdateBookData> = {};

    // Check if it's multipart/form-data
    if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData();

      // Handle cover image file upload
      const coverImageFile = formData.get('coverImage') as File | null;
      if (coverImageFile && coverImageFile.size > 0) {
        // Validate file type
        const allowedImageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        const fileExtension = path.extname(coverImageFile.name).toLowerCase();

        if (!allowedImageExtensions.includes(fileExtension)) {
          throw new ValidationError(
            `Invalid file type. Allowed types: ${allowedImageExtensions.join(', ')}`
          );
        }

        // Check file size (max 5MB)
        const maxImageSize = 5 * 1024 * 1024;
        if (coverImageFile.size > maxImageSize) {
          throw new ValidationError(`File too large. Max allowed: 5MB`);
        }

        // Generate unique filename
        const timestamp = Date.now();
        const sanitizedFileName = `cover-${bookId}-${timestamp}${fileExtension}`;

        // Convert File to Buffer
        const arrayBuffer = await coverImageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Write file to uploads/book-covers directory
        const uploadResult = await FileUtils.writeFileToSystem(buffer, sanitizedFileName, {
          directory: 'uploads/book-covers',
          overwrite: true,
          createDirectory: true,
        });

        if (!uploadResult.success) {
          throw new Error(`Failed to upload cover image: ${uploadResult.message}`);
        }

        // Delete old cover image if exists
        const existingBook = await prisma.book.findFirst({
          where: { id: bookId },
          select: { coverImageUrl: true },
        });

        if (existingBook?.coverImageUrl) {
          const oldImagePath = existingBook.coverImageUrl.replace('/api/files/', '');
          await FileUtils.deleteFileFromSystem(oldImagePath, {
            force: true,
            checkExists: true,
          });
        }

        // Set cover image URL
        body.coverImageUrl = `/api/files/uploads/book-covers/${sanitizedFileName}`;
      }

      // Extract other form fields
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
      if (authorId) body.authorId = authorId;
      if (title) body.title = title;
      if (isbn !== undefined) body.isbn = isbn;
      if (publishYear) body.publishYear = publishYear;
      if (publisher !== undefined) body.publisher = publisher;
      if (pageCount) body.pageCount = pageCount;
      if (price) body.price = price;
      if (edition !== undefined) body.edition = edition;
      if (description !== undefined) body.description = description;
      if (isDeleted !== undefined) body.isDeleted = isDeleted === 'true';
      if (categories) {
        try {
          body.categories = JSON.parse(categories);
        } catch {
          // Invalid JSON, ignore
        }
      }
    } else {
      // Handle JSON request
      body = await request.json();
    }

    // Extract fields from body
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

    const updateData: Prisma.BookUncheckedUpdateInput = {};
    if (authorId !== undefined) {
      const authorIdNum =
        typeof authorId === 'string' ? parseIntParam(authorId, 0) : Number(authorId);
      if (!authorIdNum || authorIdNum <= 0) {
        throw new ValidationError('Invalid authorId');
      }
      updateData.authorId = authorIdNum;
    }
    if (title !== undefined) updateData.title = sanitizeString(title);
    if (isbn !== undefined) updateData.isbn = isbn ? sanitizeString(isbn) : null;
    if (publishYear !== undefined)
      updateData.publishYear = publishYear ? Number(publishYear) : null;
    if (publisher !== undefined)
      updateData.publisher = publisher ? sanitizeString(publisher) : null;
    if (pageCount !== undefined) updateData.pageCount = pageCount ? Number(pageCount) : null;
    if (price !== undefined) updateData.price = price ? Number(price) : null;
    if (edition !== undefined) updateData.edition = edition ? sanitizeString(edition) : null;
    if (description !== undefined)
      updateData.description = description ? sanitizeString(description) : null;
    if (coverImageUrl !== undefined)
      updateData.coverImageUrl = coverImageUrl ? sanitizeString(coverImageUrl) : null;
    if (isDeleted !== undefined) updateData.isDeleted = Boolean(isDeleted);

    // Handle categories update
    if (categories !== undefined) {
      // Delete existing book categories
      await prisma.bookCategory.deleteMany({
        where: { bookId: bookId },
      });

      // Create new book categories if categories are provided
      if (categories && categories.length > 0) {
        updateData.bookCategories = {
          create: categories.map(categoryId => ({
            categoryId: Number(categoryId),
          })),
        };
      }
    }

    // Ensure book exists
    const existing = await prisma.book.findFirst({
      where: { id: bookId },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundError('Book not found');
    }

    const updated: Book = await prisma.book.update({
      where: { id: bookId },
      data: updateData,
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
        createdAt: true,
        updatedAt: true,
        isDeleted: true,
      },
    });

    return successResponse<Book>(updated, 'Book updated successfully');
  } catch (error) {
    return handleRouteError(error, 'PUT /api/books/[id]');
  }
});

// DELETE /api/books/[id] - Delete book (soft delete)
export const DELETE = requireLibrarian(async (request, context) => {
  const { params } = context as { params: Promise<{ id: string }> };
  try {
    const { id } = await params;
    const bookId = parseIntParam(id);

    if (bookId <= 0) {
      throw new ValidationError('Invalid book ID');
    }

    const existing = await prisma.book.findFirst({
      where: { id: bookId, isDeleted: false },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundError('Book not found');
    }

    await prisma.book.update({
      where: { id: bookId },
      data: { isDeleted: true },
    });

    return successResponse(null, 'Book deleted successfully');
  } catch (error) {
    return handleRouteError(error, 'DELETE /api/books/[id]');
  }
});
