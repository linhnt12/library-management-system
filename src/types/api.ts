// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
}

export interface PaginationResponse {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedApiResponse<T = any> extends ApiResponse<{
  users?: T[]
  books?: T[]
  authors?: T[]
  categories?: T[]
  pagination: PaginationResponse
}> {}

// Error Types
export interface ApiError {
  message: string
  code?: string
  field?: string
}

export interface ValidationError {
  field: string
  message: string
}
