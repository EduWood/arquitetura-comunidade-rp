import { NextRequest, NextResponse } from 'next/server';
import { RefreshTokenService } from '@/lib/auth/refresh-token-service';
import { ResponseHelper, SecurityHelper } from '@/lib/auth/helpers';
import { AuthError } from '@/lib/auth/errors';

// ========================================
// POST /api/auth/refresh
// ========================================

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        ResponseHelper.error('INVALID_REFRESH_TOKEN', 'Refresh token não fornecido', 401),
        { status: 401 }
      );
    }

    const userAgent = SecurityHelper.getUserAgent(request.headers);
    const ipAddress = SecurityHelper.getClientIP(request.headers);

    const result = await RefreshTokenService.refreshAccessToken(
      refreshToken,
      userAgent || undefined,
      ipAddress
    );

    const response = NextResponse.json(
      ResponseHelper.success(
        { accessToken: result.accessToken },
        'Token atualizado com sucesso'
      ),
      { status: 200 }
    );

    // Update refresh token cookie
    response.cookies.set('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        ResponseHelper.error(error.code, error.message, error.statusCode),
        { status: error.statusCode }
      );
    }

    console.error('[AUTH] Erro ao renovar token:', error);

    return NextResponse.json(
      ResponseHelper.error('INTERNAL_ERROR', 'Erro ao renovar token', 500),
      { status: 500 }
    );
  }
}
