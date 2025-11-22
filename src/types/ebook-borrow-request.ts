// Ebook Borrow Request Types
export interface CreateEbookBorrowRequestData {
  userId: number;
  bookId: number;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
}

// Ebook Borrow Request Response
export interface EbookBorrowRequestResponse {
  borrowRequest: {
    id: number;
    userId: number;
    startDate: Date;
    endDate: Date;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    items: Array<{
      borrowRequestId: number;
      bookId: number;
      quantity: number;
      startDate: Date;
      endDate: Date;
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
    }>;
  };
  borrowRecord: {
    id: number;
    status: string;
    borrowDate: Date;
    returnDate: Date;
  };
  message: string;
}

// Ebook Borrow Requests List Response
export interface EbookBorrowRequestsListResponse {
  borrowRequests: Array<{
    id: number;
    userId: number;
    startDate: Date;
    endDate: Date;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    items: Array<{
      borrowRequestId: number;
      bookId: number;
      quantity: number;
      startDate: Date;
      endDate: Date;
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
    }>;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// My Ebook Item (ebook currently borrowed)
export interface MyEbookItem {
  borrowRecordId: number;
  bookId: number;
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
    bookEditions: Array<{
      id: number;
      fileFormat: string;
      storageUrl: string;
    }>;
  };
  borrowDate: Date;
  returnDate: Date;
  daysRemaining: number;
}

// My Ebooks Response
export interface MyEbooksResponse {
  ebooks: MyEbookItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Ebook View Response (signed URL)
export interface EbookViewResponse {
  viewUrl: string;
  expiresAt: Date;
}

// Return Ebook Response
export interface ReturnEbookResponse {
  message: string;
  borrowRecord: {
    id: number;
    status: string;
    actualReturnDate: Date;
  };
}
