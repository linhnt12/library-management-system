import { ValidationError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';
import { handleRouteError, successResponse, validateRequiredFields } from '@/lib/utils';
import { requireAdmin } from '@/middleware/auth.middleware';
import { BulkDeleteDigitalLicenseData, BulkDeleteDigitalLicenseResponse } from '@/types';
import { NextRequest } from 'next/server';

// DELETE /api/digital-licenses/bulk-delete - Bulk soft delete digital licenses
export const DELETE = requireAdmin(async (request: NextRequest) => {
  try {
    const body: BulkDeleteDigitalLicenseData = await request.json();
    const { ids } = body;

    // Validate required fields
    const validationError = validateRequiredFields(body as unknown as Record<string, unknown>, [
      'ids',
    ]);
    if (validationError) {
      throw new ValidationError(validationError);
    }

    // Validate that ids is an array and not empty
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new ValidationError('ids must be a non-empty array');
    }

    // Validate that all ids are positive integers
    const validIds = ids.filter(id => Number.isInteger(id) && id > 0);
    if (validIds.length === 0) {
      throw new ValidationError('No valid digital license IDs provided');
    }

    if (validIds.length !== ids.length) {
      throw new ValidationError('All IDs must be positive integers');
    }

    // Find existing digital licenses that are not already deleted
    const existingLicenses = await prisma.digitalLicense.findMany({
      where: {
        id: { in: validIds },
      },
      select: {
        id: true,
      },
    });

    const existingIds = existingLicenses.map(license => license.id);

    if (existingIds.length === 0) {
      return successResponse<BulkDeleteDigitalLicenseResponse>(
        {
          deletedCount: 0,
          deletedIds: [],
        },
        'No digital licenses found to delete'
      );
    }

    // Perform soft delete (bulk update)
    await prisma.digitalLicense.updateMany({
      where: {
        id: { in: existingIds },
      },
      data: {
        isDeleted: true,
      },
    });

    return successResponse<BulkDeleteDigitalLicenseResponse>(
      {
        deletedCount: existingIds.length,
        deletedIds: existingIds,
      },
      `Successfully deleted ${existingIds.length} digital license(s)`
    );
  } catch (error) {
    return handleRouteError(error, 'DELETE /api/digital-licenses/bulk-delete');
  }
});
