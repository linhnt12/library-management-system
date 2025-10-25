import { DigitalLicenseModel } from '@prisma/client';

export interface DigitalLicense {
  id: number;
  bookId: number;
  licenseModel: DigitalLicenseModel;
  totalCopies: number | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

export interface DigitalLicenseWithBook extends DigitalLicense {
  book: {
    id: number;
    title: string;
  };
}

export interface CreateDigitalLicenseData {
  licenseModel: DigitalLicenseModel;
  totalCopies?: number | null;
  notes?: string | null;
}

export interface UpdateDigitalLicenseData {
  licenseModel?: DigitalLicenseModel;
  totalCopies?: number | null;
  notes?: string | null;
  isDeleted?: boolean;
}

export interface BulkDeleteDigitalLicenseData {
  ids: number[];
}

export interface BulkDeleteDigitalLicenseResponse {
  deletedCount: number;
  deletedIds: number[];
}

export interface DigitalLicensesListPayload {
  licenses: DigitalLicense[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
