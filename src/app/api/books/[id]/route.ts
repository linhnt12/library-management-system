import { NextRequest } from 'next/server';
import { BookType, Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
  successResponse,
  handleRouteError,
  parseIntParam,
  sanitizeString,
} from '@/lib/api-utils';
import { Book, UpdateBookData } from '@/types/book';
import { ValidationError, NotFoundError } from '@/lib/errors';

// GET /api/books/[id] - Get book by id
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const bookId = parseIntParam(params.id);

    if (bookId <= 0) {
      throw new ValidationError('Invalid book ID');
    }

    const book: Book | null = await prisma.book.findFirst({
      where: { id: bookId, isDeleted: false },
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

    if (!book) {
      throw new NotFoundError('Book not found');
    }

    return successResponse(book);
  } catch (error) {
    return handleRouteError(error, 'GET /api/books/[id]');
  }
}

// PUT /api/books/[id] - Update book
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const bookId = parseIntParam(params.id);

    if (bookId <= 0) {
      throw new ValidationError('Invalid book ID');
    }

    const body: UpdateBookData = await request.json();
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
    if (type !== undefined) updateData.type = type as BookType;
    if (description !== undefined)
      updateData.description = description ? sanitizeString(description) : null;
    if (coverImageUrl !== undefined)
      updateData.coverImageUrl = coverImageUrl ? sanitizeString(coverImageUrl) : null;

    // Ensure book exists
    const existing = await prisma.book.findFirst({
      where: { id: bookId, isDeleted: false },
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
        type: true,
        description: true,
        coverImageUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return successResponse<Book>(updated, 'Book updated successfully');
  } catch (error) {
    return handleRouteError(error, 'PUT /api/books/[id]');
  }
}

// DELETE /api/books/[id] - Delete book (soft delete)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const bookId = parseIntParam(params.id);

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
}
