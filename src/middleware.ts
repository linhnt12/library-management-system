import { getAccessTokenFromRequest } from '@/lib/utils/auth-utils'
import { NextRequest, NextResponse } from 'next/server'
import { ROUTES } from './constants'

export function middleware(request: NextRequest) {
	console.log('Middleware running for:', request.nextUrl.pathname)

	const token = getAccessTokenFromRequest(request)
	console.log('Token:', token);

	if (!token) {
		return NextResponse.redirect(new URL(ROUTES.LOGIN, request.url))
	}

	return NextResponse.next()
}

// Config middleware only for these routes
export const config = {
	matcher: [
		'/librarian/:path*',
		'/admin/:path*',
	],
}
