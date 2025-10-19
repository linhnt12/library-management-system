import { getAccessTokenFromRequest } from '@/lib/utils/auth-utils';
import { NextRequest, NextResponse } from 'next/server';
import { ROUTES } from './constants';

export function middleware(request: NextRequest) {
  const token = getAccessTokenFromRequest(request);

  if (!token) {
    return NextResponse.redirect(new URL(ROUTES.AUTH.LOGIN, request.url));
  }

  return NextResponse.next();
}

// Config middleware only for these routes
export const config = {
  matcher: ['/dashboard/:path*'],
};
