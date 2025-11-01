import { ConflictError, NotFoundError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';
import { CreateUserData, PublicUser, UserQueryFilters } from '@/types/user';
import { Prisma, Role, UserStatus } from '@prisma/client';

export class UserService {
  // Get users with pagination and filters
  static async getUsers(filters: UserQueryFilters) {
    const { search = '', role, status, page = 1, limit = 10, sortBy, sortOrder } = filters;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.UserWhereInput = {
      isDeleted: false,
    };

    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { email: { contains: search } },
        { phoneNumber: { contains: search } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (status) {
      where.status = status;
    }

    // Build orderBy clause
    let orderBy: Prisma.UserOrderByWithRelationInput = { createdAt: 'desc' };

    if (sortBy && sortOrder) {
      // Map frontend sort keys to database fields
      const sortFieldMap: Record<string, string> = {
        id: 'id',
        fullName: 'fullName',
        email: 'email',
        role: 'role',
        status: 'status',
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
      };

      const dbField = sortFieldMap[sortBy];
      if (dbField) {
        orderBy = { [dbField]: sortOrder };
      }
    }

    // Execute queries in parallel
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          fullName: true,
          email: true,
          phoneNumber: true,
          address: true,
          avatarUrl: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          inactiveAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users: users as PublicUser[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
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
        avatarUrl: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        inactiveAt: true,
      },
    });

    return user as PublicUser | null;
  }

  // Get multiple users by IDs
  static async getUsersByIds(ids: number[]): Promise<PublicUser[]> {
    const users = await prisma.user.findMany({
      where: {
        id: { in: ids },
        isDeleted: false,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        address: true,
        avatarUrl: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        inactiveAt: true,
      },
    });

    return users as PublicUser[];
  }

  // Create new user
  static async createUser(userData: CreateUserData): Promise<PublicUser> {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new ConflictError('Email already exists');
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
        avatarUrl: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        inactiveAt: true,
      },
    });

    return user as PublicUser;
  }

  // Update user
  static async updateUser(id: number, userData: Prisma.UserUpdateInput): Promise<PublicUser> {
    // Check if user exists
    const existingUser = await this.getUserById(id);
    if (!existingUser) {
      throw new NotFoundError('User not found');
    }

    // Extract email value from Prisma update input format
    // Can be: { set: string }, { unset: true }, or string
    let newEmail: string | undefined;
    if (userData.email) {
      if (typeof userData.email === 'string') {
        newEmail = userData.email;
      } else if (userData.email.set) {
        newEmail = userData.email.set;
      }
    }

    // Check email uniqueness if email is being changed
    if (newEmail && newEmail !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: newEmail },
      });

      if (emailExists) {
        throw new ConflictError('Email already exists');
      }
    }

    // Extract status value from Prisma update input format
    // Can be: { set: UserStatus }, { unset: true }, or UserStatus
    let newStatus: UserStatus | undefined;
    if (userData.status) {
      if (typeof userData.status === 'string') {
        newStatus = userData.status as UserStatus;
      } else if (userData.status.set) {
        newStatus = userData.status.set as UserStatus;
      }
    }

    // Prepare update data
    const updateData: Prisma.UserUpdateInput = { ...userData };

    // Set inactiveAt based on status
    if (newStatus !== undefined) {
      if (newStatus === UserStatus.INACTIVE) {
        updateData.inactiveAt = new Date();
      } else if (newStatus === UserStatus.ACTIVE) {
        updateData.inactiveAt = null;
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
        avatarUrl: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        inactiveAt: true,
      },
    });

    return updatedUser as PublicUser;
  }

  // Bulk soft delete users
  static async deleteBulkUsers(ids: number[]): Promise<{
    deletedCount: number;
    notFoundIds: number[];
  }> {
    // Find existing users
    const existingUsers = await prisma.user.findMany({
      where: {
        id: { in: ids },
        isDeleted: false,
      },
      select: { id: true },
    });

    const existingIds = existingUsers.map(user => user.id);
    const notFoundIds = ids.filter(id => !existingIds.includes(id));

    // Bulk update to soft delete
    if (existingIds.length > 0) {
      await prisma.user.updateMany({
        where: {
          id: { in: existingIds },
        },
        data: {
          isDeleted: true,
          status: UserStatus.INACTIVE,
          inactiveAt: new Date(),
        },
      });
    }

    return {
      deletedCount: existingIds.length,
      notFoundIds,
    };
  }

  // Check if email exists
  static async emailExists(email: string, excludeId?: number): Promise<boolean> {
    const where: Prisma.UserWhereInput = { email };
    if (excludeId) {
      where.id = { not: excludeId };
    }

    const user = await prisma.user.findFirst({ where });
    return !!user;
  }
}
