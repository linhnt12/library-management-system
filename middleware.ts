import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
	// TODO: Implement authentication logic
	console.log('Middleware running for:', request.nextUrl.pathname);

	return NextResponse.next();
}

// TODO: Fix later
export const config = {
	matcher: ['/admin/:path*'],
};