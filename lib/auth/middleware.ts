import { NextRequest, NextResponse } from 'next/server';
import { JWTService } from './jwt-service';
import { SecurityHelper } from './helpers';
import { AuthContext } from './types';

// ========================================
// Authentication Middleware
// ========================================

/**
 * Verify JWT token and attach user context to request
 * This middleware DOES NOT block - it just enriches the request
 */
export function withAuth(request: NextRequest): NextResponse | undefined {
  try {
    const authHeader = request.headers.get('authorization');
    const token = SecurityHelper.extractBearerToken(authHeader);

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Token não fornecido' },
        { status: 401 }
      );
    }

    const payload = JWTService.verifyAccessToken(token);

    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Token inválido ou expirado' },
        { status: 401 }
      );
    }

    // Attach auth context to request
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.userId);
    requestHeaders.set('x-user-email', payload.email);
    requestHeaders.set('x-user-role', payload.role);
    requestHeaders.set('x-session-id', payload.sessionId);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Erro ao processar autenticação' },
      { status: 500 }
    );
  }
}

/**
 * Extract auth context from request headers
 */
export function getAuthContext(request: NextRequest): AuthContext | null {
  const userId = request.headers.get('x-user-id');
  const email = request.headers.get('x-user-email');
  const role = request.headers.get('x-user-role');
  const sessionId = request.headers.get('x-session-id');

  if (!userId || !email || !role || !sessionId) {
    return null;
  }

  return {
    userId,
    email,
    role: role as any,
    sessionId,
    isAuthenticated: true,
  };
}

/**
 * Require authentication - used in API routes
 */
export async function requireAuth(request: NextRequest) {
  const authContext = getAuthContext(request);

  if (!authContext) {
    return {
      error: NextResponse.json(
        { success: false, message: 'Não autorizado' },
        { status: 401 }
      ),
      user: null,
    };
  }

  return {
    error: null,
    user: authContext,
  };
}
