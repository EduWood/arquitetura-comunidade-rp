import { NextRequest, NextResponse } from 'next/server';
import { ForgotPasswordService } from '@/lib/auth/forgot-password-service';
import { ResponseHelper } from '@/lib/auth/helpers';
import { AuthError } from '@/lib/auth/errors';

// ========================================
// POST /api/auth/reset-password
// ========================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, newPassword, confirmPassword } = body;

    // Validations
    if (!token || !newPassword || !confirmPassword) {
      return NextResponse.json(
        ResponseHelper.error(
          'VALIDATION_ERROR',
          'Token e senhas são obrigatórios',
          400
        ),
        { status: 400 }
      );
    }

    const result = await ForgotPasswordService.resetPassword(
      token,
      newPassword,
      confirmPassword
    );

    console.log('[AUTH] Senha redefinida com sucesso');

    return NextResponse.json(
      ResponseHelper.success(null, result.message),
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        ResponseHelper.error(error.code, error.message, error.statusCode),
        { status: error.statusCode }
      );
    }

    console.error('[AUTH] Erro ao redefinir senha:', error);

    return NextResponse.json(
      ResponseHelper.error('INTERNAL_ERROR', 'Erro ao redefinir senha', 500),
      { status: 500 }
    );
  }
}
