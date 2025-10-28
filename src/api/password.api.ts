/**
 * Password API Client
 * Client-side functions for password operations
 */

import { handleJson } from '@/lib/utils';
import { ResetPasswordRequest, ResetPasswordResponse } from '@/types/auth';

export class PasswordApi {
  /**
   * Reset password after OTP verification (no authentication required)
   */
  static async resetPassword(data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return await handleJson<ResetPasswordResponse>(response);
  }
}
