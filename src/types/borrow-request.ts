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

// BorrowRequest with items and user
export interface BorrowRequestWithItems extends BorrowRequest {
  items: BorrowRequestItem[];
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
