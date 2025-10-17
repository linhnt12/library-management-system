import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { JWTPayload, RefreshTokenPayload } from '@/types/auth'

// Environment variables with defaults
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m'
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d'

// Password utilities
export class PasswordUtils {
  private static readonly SALT_ROUNDS = 12

  static async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS)
  }

  static async compare(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
  }

  static validate(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long')
    }

    if (password.length > 128) {
      errors.push('Password must not exceed 128 characters')
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number')
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character')
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }
}

// JWT utilities
export class JWTUtils {
  static generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'library-management-system',
      audience: 'library-users',
    } as jwt.SignOptions)
  }

  static generateRefreshToken(payload: Omit<RefreshTokenPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, JWT_REFRESH_SECRET, {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
      issuer: 'library-management-system',
      audience: 'library-users',
    } as jwt.SignOptions)
  }

  static verifyAccessToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, JWT_SECRET, {
        issuer: 'library-management-system',
        audience: 'library-users',
      }) as JWTPayload
    } catch (error) {
      throw new Error('Invalid or expired access token')
    }
  }

  static verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
      return jwt.verify(token, JWT_REFRESH_SECRET, {
        issuer: 'library-management-system',
        audience: 'library-users',
      }) as RefreshTokenPayload
    } catch (error) {
      throw new Error('Invalid or expired refresh token')
    }
  }

  static decodeToken(token: string): any {
    return jwt.decode(token)
  }

  static getTokenExpiration(token: string): Date | null {
    const decoded = this.decodeToken(token)
    if (decoded && decoded.exp) {
      return new Date(decoded.exp * 1000)
    }
    return null
  }
}

// Email validation
export class EmailUtils {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  static isValid(email: string): boolean {
    return this.EMAIL_REGEX.test(email.toLowerCase())
  }

  static normalize(email: string): string {
    return email.toLowerCase().trim()
  }
}

// General validation utilities
export class ValidationUtils {
  static validateFullName(fullName: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!fullName || fullName.trim().length === 0) {
      errors.push('Full name is required')
    }

    if (fullName.length < 2) {
      errors.push('Full name must be at least 2 characters long')
    }

    if (fullName.length > 255) {
      errors.push('Full name must not exceed 255 characters')
    }

    if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(fullName)) {
      errors.push('Full name can only contain letters and spaces')
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  static validatePhoneNumber(phoneNumber: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (phoneNumber && phoneNumber.trim().length > 0) {
      // Remove all non-digit characters for validation
      const digitsOnly = phoneNumber.replace(/\D/g, '')

      if (digitsOnly.length < 10 || digitsOnly.length > 15) {
        errors.push('Phone number must be between 10 and 15 digits')
      }

      if (!/^[\d\s\-\+\(\)]+$/.test(phoneNumber)) {
        errors.push('Phone number contains invalid characters')
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  static sanitizeString(input: string): string {
    return input.trim().replace(/[<>]/g, '')
  }
}

// Rate limiting utilities
export class RateLimitUtils {
  private static attempts: Map<string, { count: number; resetTime: number }> = new Map()

  static checkRateLimit(
    identifier: string,
    maxAttempts: number = 5,
    windowMs: number = 15 * 60 * 1000 // 15 minutes
  ): { allowed: boolean; remainingAttempts: number; resetTime: number } {
    const now = Date.now()
    const key = identifier.toLowerCase()
    const record = this.attempts.get(key)

    if (!record || now > record.resetTime) {
      // Reset or create new record
      this.attempts.set(key, { count: 1, resetTime: now + windowMs })
      return {
        allowed: true,
        remainingAttempts: maxAttempts - 1,
        resetTime: now + windowMs,
      }
    }

    if (record.count >= maxAttempts) {
      return {
        allowed: false,
        remainingAttempts: 0,
        resetTime: record.resetTime,
      }
    }

    // Increment attempt count
    record.count++
    this.attempts.set(key, record)

    return {
      allowed: true,
      remainingAttempts: maxAttempts - record.count,
      resetTime: record.resetTime,
    }
  }

  static resetRateLimit(identifier: string): void {
    this.attempts.delete(identifier.toLowerCase())
  }
}
