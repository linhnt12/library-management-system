import { NotFoundError, ValidationError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';
import { handleRouteError, parseIntParam, sanitizeString, successResponse } from '@/lib/utils';
import { Book, BookWithAuthorAndItems, UpdateBookData } from '@/types/book';
import { Prisma } from '@prisma/client';
import { NextRequest } from 'next/server';

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
      },
    });

    if (!book) {
      throw new NotFoundError('Book not found');
    }

    return successResponse<BookWithAuthorAndItems>(book);
  } catch (error) {
    return handleRouteError(error, 'GET /api/books/[id]');
  }
}

// PUT /api/books/[id] - Update book
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const bookId = parseIntParam(id);

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
      description,
      coverImageUrl,
      isDeleted,
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
}

// DELETE /api/books/[id] - Delete book (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
}
