// BorrowRecord Types from Prisma
export interface BorrowRecord {
  id: number;
  userId: number;
  borrowDate: Date;
  returnDate: Date | null;
  actualReturnDate: Date | null;
  renewalCount: number;
  status: BorrowStatus;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

export enum BorrowStatus {
  BORROWED = 'BORROWED',
  RETURNED = 'RETURNED',
  OVERDUE = 'OVERDUE',
}

// BorrowRecord with user and book items
export interface BorrowRecordWithDetails extends BorrowRecord {
  user?: {
    id: number;
    fullName: string;
    email: string;
  };
  borrowBooks?: Array<{
    bookItem: {
      id: number;
      code: string;
      book: {
        id: number;
        title: string;
        author: {
          id: number;
          fullName: string;
        };
      };
    };
  }>;
}

// Create BorrowRecord data
export interface CreateBorrowRecordData {
  userId: number;
  borrowDate: string; // ISO date string
  returnDate: string; // ISO date string
  bookItemIds: number[]; // Array of book item IDs to borrow
  requestIds?: number[]; // Optional: Array of request IDs to fulfill (if creating from approved requests)
}

// Create BorrowRecord response
export interface CreateBorrowRecordResponse {
  borrowRecord: BorrowRecordWithDetails;
  fulfilledRequests?: Array<{
    id: number;
    status: string;
  }>;
  message: string;
}
