import { LoginRequest, RegisterRequest, ChangePasswordRequest, AuthUser } from '@/types/auth';
import { getAccessToken, setAccessToken, clearAccessToken, handleJson } from '@/lib/utils';

export class AuthApi {
    // Login and persist access token
    static async login(credentials: LoginRequest): Promise<void> {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(credentials),
        });

        const data = await handleJson<{ user: AuthUser; accessToken: string }>(response);
        setAccessToken(data.accessToken);
    }

    // Register new account
    static async register(payload: RegisterRequest): Promise<void> {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        await handleJson<{ user: AuthUser; message: string }>(response);
    }

    // Get current user using stored access token
    static async me(): Promise<AuthUser> {
        const token = getAccessToken();
        const headers: Record<string, string> = {};
        if (token) headers.Authorization = `Bearer ${token}`;
        const response = await fetch('/api/auth/me', {
            method: 'GET',
            headers,
        });
        return await handleJson<AuthUser>(response);
    }

    // Change password (requires auth)
    static async changePassword(payload: ChangePasswordRequest): Promise<void> {
        const token = getAccessToken();
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;
        const response = await fetch('/api/auth/change-password', {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
        });
        await handleJson<null>(response);
    }

    // Refresh access token using httpOnly cookie
    static async refresh(): Promise<void> {
        const response = await fetch('/api/auth/refresh', {
            method: 'POST',
            credentials: 'include',
        });
        const data = await handleJson<{ accessToken: string }>(response);
        setAccessToken(data.accessToken);
    }

    // Logout and clear access token
    static async logout(): Promise<void> {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });
        } finally {
            clearAccessToken();
        }
    }
}
