import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { projectStore } from '@/lib/store/projectStore';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Skip API routes and static files
  if (pathname.startsWith('/api') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // Check if the page exists in the project store
  const pages = projectStore.getAllPages();
  const pageExists = pages.some(page => page.path === pathname);

  if (!pageExists) {
    return NextResponse.redirect(new URL('/404', request.url));
  }

  return NextResponse.next();
}

// Configure which paths should handle CORS
export const config = {
  matcher: '/api/:path*',
};