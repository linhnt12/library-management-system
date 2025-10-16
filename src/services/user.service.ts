import { prisma } from '@/lib/prisma'
import { Role, UserStatus } from '@prisma/client'
import { CreateUserData, UpdateUserData, UserQueryFilters, PublicUser } from '@/types/user'
import { ConflictError, NotFoundError } from '@/lib/errors'

export class UserService {
  // Get users with pagination and filters
  static async getUsers(filters: UserQueryFilters) {
    const {
      search = '',
      role,
      status,
      page = 1,
      limit = 10,
    } = filters

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      isDeleted: false,
    }

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (role) {
      where.role = role
    }

    if (status) {
      where.status = status
    }

    // Execute queries in parallel
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          fullName: true,
          email: true,
          phoneNumber: true,
          address: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          inactiveAt: true,
        },
      }),
      prisma.user.count({ where }),
    ])

    return {
      users: users as PublicUser[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  // Get user by ID
  static async getUserById(id: number): Promise<PublicUser | null> {
    const user = await prisma.user.findFirst({
      where: {
        id,
        isDeleted: false,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        address: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        inactiveAt: true,
      },
    })

    return user as PublicUser | null
  }

  // Create new user
  static async createUser(userData: CreateUserData): Promise<PublicUser> {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    })

    if (existingUser) {
      throw new ConflictError('Email already exists')
    }

    const user = await prisma.user.create({
      data: {
        fullName: userData.fullName,
        email: userData.email,
        password: userData.password, // Note: Hash this in production
        phoneNumber: userData.phoneNumber || null,
        address: userData.address || null,
        role: userData.role || Role.READER,
        status: UserStatus.ACTIVE,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        address: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        inactiveAt: true,
      },
    })

    return user as PublicUser
  }

  // Update user
  static async updateUser(id: number, userData: UpdateUserData): Promise<PublicUser> {
    // Check if user exists
    const existingUser = await this.getUserById(id)
    if (!existingUser) {
      throw new NotFoundError('User not found')
    }

    // Check email uniqueness if email is being changed
    if (userData.email && userData.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: userData.email },
      })

      if (emailExists) {
        throw new ConflictError('Email already exists')
      }
    }

    // Prepare update data
    const updateData: any = { ...userData }

    if (userData.status !== undefined) {
      if (userData.status === UserStatus.INACTIVE) {
        updateData.inactiveAt = new Date()
      } else if (userData.status === UserStatus.ACTIVE) {
        updateData.inactiveAt = null
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        address: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        inactiveAt: true,
      },
    })

    return updatedUser as PublicUser
  }

  // Soft delete user
  static async deleteUser(id: number): Promise<void> {
    // Check if user exists
    const existingUser = await this.getUserById(id)
    if (!existingUser) {
      throw new NotFoundError('User not found')
    }

    await prisma.user.update({
      where: { id },
      data: {
        isDeleted: true,
        status: UserStatus.INACTIVE,
        inactiveAt: new Date(),
      },
    })
  }

  // Check if email exists
  static async emailExists(email: string, excludeId?: number): Promise<boolean> {
    const where: any = { email }
    if (excludeId) {
      where.id = { not: excludeId }
    }

    const user = await prisma.user.findFirst({ where })
    return !!user
  }

  // Get user statistics
  static async getUserStats() {
    const [total, active, inactive, admins, librarians, readers] = await Promise.all([
      prisma.user.count({ where: { isDeleted: false } }),
      prisma.user.count({ where: { isDeleted: false, status: UserStatus.ACTIVE } }),
      prisma.user.count({ where: { isDeleted: false, status: UserStatus.INACTIVE } }),
      prisma.user.count({ where: { isDeleted: false, role: Role.ADMIN } }),
      prisma.user.count({ where: { isDeleted: false, role: Role.LIBRARIAN } }),
      prisma.user.count({ where: { isDeleted: false, role: Role.READER } }),
    ])

    return {
      total,
      active,
      inactive,
      byRole: {
        admins,
        librarians,
        readers,
      },
    }
  }
}
