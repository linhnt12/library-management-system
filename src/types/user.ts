import { Role, UserStatus } from '@prisma/client'

// User Types from Prisma
export interface User {
  id: number
  fullName: string
  email: string
  phoneNumber?: string | null
  address?: string | null
  role: Role
  status: UserStatus
  createdAt: Date
  updatedAt: Date
  inactiveAt?: Date | null
  isDeleted: boolean
}

// User without sensitive data (for API responses)
export interface PublicUser {
  id: number
  fullName: string
  email: string
  phoneNumber?: string | null
  address?: string | null
  role: Role
  status: UserStatus
  createdAt: Date
  updatedAt: Date
  inactiveAt?: Date | null
}

// User creation data
export interface CreateUserData {
  fullName: string
  email: string
  password: string
  phoneNumber?: string
  address?: string
  role?: Role
}

// User update data
export interface UpdateUserData {
  fullName?: string
  email?: string
  phoneNumber?: string
  address?: string
  role?: Role
  status?: UserStatus
}

// User query filters
export interface UserQueryFilters {
  search?: string
  role?: Role
  status?: UserStatus
  page?: number
  limit?: number
}
