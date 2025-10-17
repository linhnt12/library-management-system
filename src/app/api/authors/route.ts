import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/authors - Get authors
export async function GET() {
  try {
    const authors = await prisma.author.findMany({
      select: {
        id: true,
        fullName: true,
      },
      orderBy: {
        fullName: 'asc',
      },
    });

    return NextResponse.json(authors);
  } catch (error) {
    console.error('Error fetching authors:', error);
    return NextResponse.json({ error: 'Failed to fetch authors' }, { status: 500 });
  }
}
