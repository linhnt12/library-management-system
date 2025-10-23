import { PaginationResponse } from '@/types/api';

// Review Types from Prisma
export interface Review {
  id: number;
  userId: number;
  bookId: number;
  rating: number;
  reviewText: string | null;
  reviewDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

// Review with user information
export interface ReviewWithUser extends Review {
  user: {
    id: number;
    fullName: string;
    email: string;
  };
}

// Review creation data
export interface CreateReviewData {
  userId: number;
  bookId: number;
  rating: number;
  reviewText?: string | null;
  reviewDate?: Date | null;
}

// Review update data
export interface UpdateReviewData {
  rating?: number;
  reviewText?: string | null;
  reviewDate?: Date | null;
  isDeleted?: boolean;
}

// Review statistics
export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    rating: number;
    count: number;
    percentage: number;
  }[];
}

// Reviews list payload
export interface ReviewsListPayload {
  reviews: ReviewWithUser[];
  pagination: PaginationResponse;
}

// Review display data
export interface ReviewDisplayData {
  id: number;
  userId: number;
  userName: string;
  userAvatar: string;
  rating: number;
  reviewText: string;
  reviewDate: string;
  createdAt: string;
}
