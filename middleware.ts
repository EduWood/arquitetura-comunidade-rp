import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev-secret'
);

// Rotas públicas
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

// Rotas de membro
const MEMBER_ROUTES = [
  '/membros',
  '/dashboard',
  '/meus-cursos',
  '/certificados',
  '/meus-downloads',
  '/perfil',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permite rotas públicas
  if (
    PUBLIC_ROUTES.some(
      route =>
        pathname === route ||
        pathname.startsWith(route + '/')
    )
  ) {
    return NextResponse.next();
  }

  let token = request.cookies.get('token')?.value;

  if (!token) {
    const authHeader = request.headers.get('authorization');

    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    }
  }

  // Sem token
  if (!token) {
    return NextResponse.next();
  }

  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    const payload = verified.payload as any;

    // Área admin
    if (pathname.startsWith('/admin')) {
      if (
        !payload.role ||
        !['SUPER_ADMIN', 'ADMIN'].includes(payload.role)
      ) {
        return NextResponse.redirect(
          new URL('/', request.url)
        );
      }
    }

    // Área membro
    if (
      MEMBER_ROUTES.some(route =>
        pathname.startsWith(route)
      )
    ) {
      if (
        !payload.role ||
        ![
          'SUPER_ADMIN',
          'ADMIN',
          'MEMBRO',
          'ALUNO',
        ].includes(payload.role)
      ) {
        return NextResponse.redirect(
          new URL('/login', request.url)
        );
      }
    }

    const requestHeaders = new Headers(request.headers);

    requestHeaders.set(
      'x-user-id',
      String(payload.userId || '')
    );

    requestHeaders.set(
      'x-user-email',
      String(payload.email || '')
    );

    requestHeaders.set(
      'x-user-role',
      String(payload.role || '')
    );

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};