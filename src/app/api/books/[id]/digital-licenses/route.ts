import { NotFoundError, ValidationError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';
import {
  handleRouteError,
  parseIntParam,
  parsePaginationParams,
  sanitizeString,
  successResponse,
  validateRequiredFields,
} from '@/lib/utils';
import { requireAdmin } from '@/middleware/auth.middleware';
import { CreateDigitalLicenseData, DigitalLicense, UpdateDigitalLicenseData } from '@/types';
import { Prisma } from '@prisma/client';
import { NextRequest } from 'next/server';

// GET /api/books/[id]/digital-licenses - Get digital licenses by book id with pagination
export const GET = requireAdmin(async (request: NextRequest, context?: unknown) => {
  const { params } = context as { params: Promise<{ id: string }> };
  try {
    const { id } = await params;
    const bookId = parseIntParam(id);

    if (bookId <= 0) {
      throw new ValidationError('Invalid book ID');
    }

    // Parse pagination params
    const { searchParams } = new URL(request.url);
    const { page, limit, search } = parsePaginationParams(searchParams);

    // Optional sorting
    const sortBy = searchParams.get('sortBy');
    const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' | null;

    // Check if book exists
    const book = await prisma.book.findFirst({
      where: { id: bookId, isDeleted: false },
      select: { id: true },
    });

    if (!book) {
      throw new ValidationError('Book not found');
    }

    // Build where clause
    const where: Prisma.DigitalLicenseWhereInput = {
      bookId: bookId,
      isDeleted: false,
    };

    // Add search filter if provided (only search in notes since licenseModel is an enum)
    if (search) {
      where.notes = { contains: search };
    }

    const skip = (page - 1) * limit;

    // Build orderBy clause
    let orderBy: Prisma.DigitalLicenseOrderByWithRelationInput = { createdAt: 'desc' };

    if (sortBy && sortOrder) {
      const sortFieldMap: Record<string, string> = {
        id: 'id',
        licenseModel: 'licenseModel',
        totalCopies: 'totalCopies',
        notes: 'notes',
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
      };

      const dbField = sortFieldMap[sortBy];
      if (dbField) {
        orderBy = { [dbField]: sortOrder };
      }
    }

    // Fetch digital licenses with pagination
    const [digitalLicenses, total] = await Promise.all([
      prisma.digitalLicense.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          bookId: true,
          licenseModel: true,
          totalCopies: true,
          notes: true,
          createdAt: true,
          updatedAt: true,
          isDeleted: true,
        },
      }),
      prisma.digitalLicense.count({ where }),
    ]);

    return successResponse({
      licenses: digitalLicenses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleRouteError(error, 'GET /api/books/[id]/digital-licenses');
  }
});

// POST /api/books/[id]/digital-licenses - Create digital license for a book
export const POST = requireAdmin(async (request: NextRequest, context?: unknown) => {
  const { params } = context as { params: Promise<{ id: string }> };
  try {
    const { id } = await params;
    const bookId = parseIntParam(id);

    if (bookId <= 0) {
      throw new ValidationError('Invalid book ID');
    }

    const body: CreateDigitalLicenseData = await request.json();
    const { licenseModel, totalCopies, notes } = body;

    // Validate required fields
    const validationError = validateRequiredFields(body as unknown as Record<string, unknown>, [
      'licenseModel',
    ]);
    if (validationError) {
      throw new ValidationError(validationError);
    }

    // Check if book exists
    const book = await prisma.book.findFirst({
      where: { id: bookId, isDeleted: false },
      select: { id: true },
    });

    if (!book) {
      throw new ValidationError('Book not found');
    }

    // Prepare data
    const data: Prisma.DigitalLicenseUncheckedCreateInput = {
      bookId: bookId,
      licenseModel: licenseModel,
      totalCopies: totalCopies !== undefined ? (totalCopies ? Number(totalCopies) : null) : null,
      notes: notes ? sanitizeString(notes) : null,
      isDeleted: false,
    };

    const created: DigitalLicense = await prisma.digitalLicense.create({
      data,
      select: {
        id: true,
        bookId: true,
        licenseModel: true,
        totalCopies: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        isDeleted: true,
      },
    });

    return successResponse<DigitalLicense>(created, 'Digital license created successfully', 201);
  } catch (error) {
    return handleRouteError(error, 'POST /api/books/[id]/digital-licenses');
  }
});

// PATCH /api/books/[id]/digital-licenses - Update digital license for a book
export const PATCH = requireAdmin(async (request: NextRequest, context?: unknown) => {
  const { params } = context as { params: Promise<{ id: string }> };
  try {
    const { id } = await params;
    const bookId = parseIntParam(id);

    if (bookId <= 0) {
      throw new ValidationError('Invalid book ID');
    }

    const body: UpdateDigitalLicenseData = await request.json();
    const { licenseModel, totalCopies, notes, isDeleted } = body;

    // Check if book exists
    const book = await prisma.book.findFirst({
      where: { id: bookId, isDeleted: false },
      select: { id: true },
    });

    if (!book) {
      throw new ValidationError('Book not found');
    }

    // Check if digital license exists for this book
    const existingLicense = await prisma.digitalLicense.findFirst({
      where: { bookId: bookId, isDeleted: false },
      select: { id: true },
    });

    if (!existingLicense) {
      throw new NotFoundError('Digital license not found for this book');
    }

    // Prepare update data
    const updateData: Prisma.DigitalLicenseUncheckedUpdateInput = {};

    if (licenseModel !== undefined) {
      updateData.licenseModel = licenseModel;
    }
    if (totalCopies !== undefined) {
      updateData.totalCopies = totalCopies ? Number(totalCopies) : null;
    }
    if (notes !== undefined) {
      updateData.notes = notes ? sanitizeString(notes) : null;
    }
    if (isDeleted !== undefined) {
      updateData.isDeleted = Boolean(isDeleted);
    }

    // Update the digital license
    const updated: DigitalLicense = await prisma.digitalLicense.update({
      where: { id: existingLicense.id },
      data: updateData,
      select: {
        id: true,
        bookId: true,
        licenseModel: true,
        totalCopies: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        isDeleted: true,
      },
    });

    return successResponse<DigitalLicense>(updated, 'Digital license updated successfully');
  } catch (error) {
    return handleRouteError(error, 'PATCH /api/books/[id]/digital-licenses');
  }
});
