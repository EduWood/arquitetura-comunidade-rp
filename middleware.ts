import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET!
);

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/registro',
  '/esqueci-senha',
  '/reset-senha',
  '/cursos',
  '/sobre',
  '/contato',
  '/politica-privacidade',
  '/termos-uso',
];

// Routes that require admin role
const ADMIN_ROUTES = ['/admin'];

// Routes that require member role
const MEMBER_ROUTES = ['/membros', '/dashboard', '/meus-cursos', '/certificados', '/meus-downloads', '/perfil'];

// Subroutes under (member) group
const MEMBER_SUBROUTES = ['/(member)'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route is public
  const isPublic = PUBLIC_ROUTES.some(route => pathname.startsWith(route));
  if (isPublic) {
    return NextResponse.next();
  }

  // Get token from cookies OR from Authorization header (Bearer token)
  let token = request.cookies.get('token')?.value;
  
  // Also check Authorization header for Bearer token (from useAuth hook)
  if (!token) {
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    }
  }

  if (!token) {
    // If member or admin route and no token, redirect to login
    if (pathname.startsWith('/(member)') || pathname.startsWith('/admin') || 
        MEMBER_ROUTES.some(route => pathname.startsWith(route))) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  try {
    // Verify JWT token
    const verified = await jwtVerify(token, JWT_SECRET);
    const payload = verified.payload as any;

    // Check if user has required role for admin routes
    if (pathname.startsWith('/admin')) {
      if (!payload.role || !['SUPER_ADMIN', 'ADMIN'].includes(payload.role)) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }

    // Check if user has required role for member routes (check both /member and /(member) patterns)
    if (pathname.startsWith('/(member)') || MEMBER_ROUTES.some(route => pathname.startsWith(route))) {
      if (!payload.role || !['SUPER_ADMIN', 'ADMIN', 'MEMBRO', 'ALUNO'].includes(payload.role)) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }

    // Add user info to request headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.userId || '');
    requestHeaders.set('x-user-email', payload.email || '');
    requestHeaders.set('x-user-role', payload.role || '');

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    // Invalid token
    if (pathname.startsWith('/(member)') || pathname.startsWith('/admin') ||
        MEMBER_ROUTES.some(route => pathname.startsWith(route))) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }
}

// Configure which routes should be processed by middleware
export const config = {
  matcher: [
    // Match all routes except static files and API
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
