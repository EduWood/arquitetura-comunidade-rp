import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/auth-service';
import { requireAuth } from '@/lib/auth/middleware';
import { ResponseHelper } from '@/lib/auth/helpers';
import { AuthError } from '@/lib/auth/errors';

// ========================================
// POST /api/auth/change-password
// ========================================

export async function POST(request: NextRequest) {
  try {
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

    const result = await AuthService.changePassword(
      user.userId,
      currentPassword,
      newPassword,
      confirmPassword
    );

    console.log('[AUTH] Senha alterada:', user.email);

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
