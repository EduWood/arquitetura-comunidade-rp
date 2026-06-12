import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/auth-service';
import { requireAuth } from '@/lib/auth/middleware';
import { ResponseHelper, SecurityHelper } from '@/lib/auth/helpers';
import { AuthError } from '@/lib/auth/errors';
import { validateCORSMiddleware } from '@/lib/cors';

// ========================================
// POST /api/auth/change-password
// ========================================

export async function POST(request: NextRequest) {
  try {
    // Validate CORS
    const corsValidation = await validateCORSMiddleware(request);
    if (!corsValidation.isValid) {
      return corsValidation.response!;
    }

    const { error, user } = await requireAuth(request);

    if (error) {
      return error;
    }

    if (!user) {
      return NextResponse.json(
        ResponseHelper.error('UNAUTHORIZED', 'Não autorizado', 401),
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    // Validations
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        ResponseHelper.error(
          'VALIDATION_ERROR',
          'Todos os campos de senha são obrigatórios',
          400
        ),
        { status: 400 }
      );
    }

    // Get client info
    const ipAddress = SecurityHelper.getClientIP(request.headers);

    const result = await AuthService.changePassword(
      user.userId,
      currentPassword,
      newPassword,
      confirmPassword,
      ipAddress
    );

    const response = NextResponse.json(
      ResponseHelper.success(null, result.message),
      { status: 200 }
    );

    // Clear refresh token cookie (user must login again)
    response.cookies.set('refreshToken', '', {
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        ResponseHelper.error(error.code, error.message, error.statusCode, error.details),
        { status: error.statusCode }
      );
    }

    console.error('[AUTH] Erro ao alterar senha:', error);

    return NextResponse.json(
      ResponseHelper.error('INTERNAL_ERROR', 'Erro ao alterar senha', 500),
      { status: 500 }
    );
  }
}
