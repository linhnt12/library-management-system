import { prisma } from '@/lib/prisma'
import { Role, UserStatus } from '@prisma/client'
import {
  RegisterRequest,
  LoginRequest,
  AuthUser,
  LoginResponse,
  RegisterResponse,
  ChangePasswordRequest,
} from '@/types/auth'
import {
  PasswordUtils,
  JWTUtils,
  EmailUtils,
  ValidationUtils,
  RateLimitUtils,
} from '@/lib/auth-utils'
import { randomBytes } from 'crypto'

export class AuthService {
  // Register new user
  static async register(userData: RegisterRequest): Promise<RegisterResponse> {
    const { fullName, email, password, confirmPassword, phoneNumber, address } = userData

    // Validate input data
    const validationErrors: string[] = []

    // Validate full name
    const fullNameValidation = ValidationUtils.validateFullName(fullName)
    if (!fullNameValidation.isValid) {
      validationErrors.push(...fullNameValidation.errors)
    }

    // Validate email
    if (!EmailUtils.isValid(email)) {
      validationErrors.push('Invalid email format')
    }

    // Validate password
    const passwordValidation = PasswordUtils.validate(password)
    if (!passwordValidation.isValid) {
      validationErrors.push(...passwordValidation.errors)
    }

    // Check password confirmation
    if (password !== confirmPassword) {
      validationErrors.push('Passwords do not match')
    }

    // Validate phone number if provided
    if (phoneNumber) {
      const phoneValidation = ValidationUtils.validatePhoneNumber(phoneNumber)
      if (!phoneValidation.isValid) {
        validationErrors.push(...phoneValidation.errors)
      }
    }

    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`)
    }

    // Check rate limiting
    const normalizedEmail = EmailUtils.normalize(email)
    const rateLimit = RateLimitUtils.checkRateLimit(`register:${normalizedEmail}`, 3, 60 * 60 * 1000) // 3 attempts per hour
    if (!rateLimit.allowed) {
      throw new Error('Too many registration attempts. Please try again later.')
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existingUser) {
      throw new Error('Email already registered')
    }

    // Hash password
    const hashedPassword = await PasswordUtils.hash(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        fullName: ValidationUtils.sanitizeString(fullName),
        email: normalizedEmail,
        password: hashedPassword,
        phoneNumber: phoneNumber ? ValidationUtils.sanitizeString(phoneNumber) : null,
        address: address ? ValidationUtils.sanitizeString(address) : null,
        role: Role.READER, // Default role
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
      },
    })

    // Reset rate limit on successful registration
    RateLimitUtils.resetRateLimit(`register:${normalizedEmail}`)

    return {
      user: user as AuthUser,
      message: 'Account created successfully',
    }
  }

  // Login user
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    const { email, password, rememberMe = false } = credentials

    // Validate input
    if (!EmailUtils.isValid(email)) {
      throw new Error('Invalid email format')
    }

    if (!password || password.length === 0) {
      throw new Error('Password is required')
    }

    const normalizedEmail = EmailUtils.normalize(email)

    // Check rate limiting
    const rateLimit = RateLimitUtils.checkRateLimit(`login:${normalizedEmail}`, 5, 15 * 60 * 1000) // 5 attempts per 15 minutes
    if (!rateLimit.allowed) {
      throw new Error('Too many login attempts. Please try again later.')
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        fullName: true,
        email: true,
        password: true,
        phoneNumber: true,
        address: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        isDeleted: true,
      },
    })

    if (!user || user.isDeleted) {
      throw new Error('Invalid email or password')
    }

    // Check if user is active
    if (user.status !== UserStatus.ACTIVE) {
      throw new Error('Account is inactive. Please contact administrator.')
    }

    // Verify password
    const isPasswordValid = await PasswordUtils.compare(password, user.password)
    if (!isPasswordValid) {
      throw new Error('Invalid email or password')
    }

    // Reset rate limit on successful login
    RateLimitUtils.resetRateLimit(`login:${normalizedEmail}`)

    // Generate tokens
    const tokenId = randomBytes(16).toString('hex')
    const accessToken = JWTUtils.generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    const refreshToken = JWTUtils.generateRefreshToken({
      userId: user.id,
      tokenId,
    })

    // Store refresh token in database (optional - for token revocation)
    await prisma.refreshToken.create({
      data: {
        id: tokenId,
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + (rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000), // 30 days if remember me, 7 days otherwise
      },
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return {
      user: userWithoutPassword as AuthUser,
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15 minutes in seconds
    }
  }

  // Refresh access token
  static async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
    try {
      // Verify refresh token
      const payload = JWTUtils.verifyRefreshToken(refreshToken)

      // Check if refresh token exists in database
      const storedToken = await prisma.refreshToken.findUnique({
        where: { id: payload.tokenId },
        include: { user: true },
      })

      if (!storedToken || storedToken.token !== refreshToken) {
        throw new Error('Invalid refresh token')
      }

      // Check if token is expired
      if (storedToken.expiresAt < new Date()) {
        // Clean up expired token
        await prisma.refreshToken.delete({
          where: { id: payload.tokenId },
        })
        throw new Error('Refresh token expired')
      }

      // Check if user is still active
      if (storedToken.user.status !== UserStatus.ACTIVE || storedToken.user.isDeleted) {
        throw new Error('User account is inactive')
      }

      // Generate new access token
      const accessToken = JWTUtils.generateAccessToken({
        userId: storedToken.user.id,
        email: storedToken.user.email,
        role: storedToken.user.role,
      })

      return {
        accessToken,
        expiresIn: 15 * 60, // 15 minutes in seconds
      }
    } catch (error) {
      throw new Error('Invalid or expired refresh token')
    }
  }

  // Logout user
  static async logout(refreshToken: string): Promise<void> {
    try {
      const payload = JWTUtils.verifyRefreshToken(refreshToken)
      
      // Remove refresh token from database
      await prisma.refreshToken.delete({
        where: { id: payload.tokenId },
      })
    } catch (error) {
      // Token might already be invalid/expired, which is fine for logout
    }
  }

  // Logout from all devices
  static async logoutAll(userId: number): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { userId },
    })
  }

  // Change password
  static async changePassword(userId: number, passwordData: ChangePasswordRequest): Promise<void> {
    const { currentPassword, newPassword, confirmNewPassword } = passwordData

    // Validate new password
    const passwordValidation = PasswordUtils.validate(newPassword)
    if (!passwordValidation.isValid) {
      throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`)
    }

    // Check password confirmation
    if (newPassword !== confirmNewPassword) {
      throw new Error('New passwords do not match')
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Verify current password
    const isCurrentPasswordValid = await PasswordUtils.compare(currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect')
    }

    // Check if new password is different from current
    const isSamePassword = await PasswordUtils.compare(newPassword, user.password)
    if (isSamePassword) {
      throw new Error('New password must be different from current password')
    }

    // Hash new password
    const hashedNewPassword = await PasswordUtils.hash(newPassword)

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    })

    // Logout from all devices (invalidate all refresh tokens)
    await this.logoutAll(userId)
  }

  // Get user by ID (for authentication middleware)
  static async getUserById(userId: number): Promise<AuthUser | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
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
        isDeleted: true,
      },
    })

    if (!user || user.isDeleted || user.status !== UserStatus.ACTIVE) {
      return null
    }

    const { isDeleted: _, ...userWithoutDeleted } = user
    return userWithoutDeleted as AuthUser
  }

  // Clean up expired refresh tokens (should be run periodically)
  static async cleanupExpiredTokens(): Promise<number> {
    const result = await prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    })

    return result.count
  }
}
