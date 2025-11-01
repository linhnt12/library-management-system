// BorrowRequest Types from Prisma
export interface BorrowRequest {
  id: number;
  userId: number;
  startDate: Date;
  endDate: Date;
  status: BorrowRequestStatus;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

export enum BorrowRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
  FULFILLED = 'FULFILLED',
}

// BorrowRequestItem Types
export interface BorrowRequestItem {
  borrowRequestId: number;
  bookId: number;
  quantity: number;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

// BorrowRequestItem with book information
export interface BorrowRequestItemWithBook extends BorrowRequestItem {
  book: {
    id: number;
    title: string;
    isbn: string | null;
    coverImageUrl: string | null;
    publishYear: number | null;
    author: {
      id: number;
      fullName: string;
    };
  };
  queuePosition?: number | null; // Queue position (only when status = PENDING)
}

// BorrowRequest with items and user
export interface BorrowRequestWithItems extends BorrowRequest {
  items: BorrowRequestItem[];
  user?: {
    id: number;
    fullName: string;
    email: string;
  };
}

// BorrowRequest with items that include book information
export interface BorrowRequestWithBook extends BorrowRequest {
  items: BorrowRequestItemWithBook[];
}

// BorrowRequest with items that include book information and user information
export interface BorrowRequestWithBookAndUser extends BorrowRequest {
  items: BorrowRequestItemWithBook[];
  user?: {
    id: number;
    fullName: string;
    email: string;
  };
}

// Create BorrowRequest data
export interface CreateBorrowRequestData {
  userId: number;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  items: BorrowRequestItemData[];
}

export interface BorrowRequestItemData {
  bookId: number;
  quantity: number;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
}

// BorrowRequest response
export interface BorrowRequestResponse {
  borrowRequest: BorrowRequestWithItems;
  borrowRecord?: {
    id: number;
    status: string;
  } | null;
  queuePosition?: number | null;
  message: string;
}

// BorrowRequests list response
export interface BorrowRequestsListResponse {
  borrowRequests: BorrowRequestWithBook[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
