import { NextRequest, NextResponse } from 'next/server';
import { LoginService } from '@/lib/auth/login-service';
import { ValidationHelper, ResponseHelper, SecurityHelper } from '@/lib/auth/helpers';
import { AuthError } from '@/lib/auth/errors';

// ========================================
// POST /api/auth/login
// ========================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, rememberMe } = body;

    // Validations
    const requiredFields = { email, password };
    const validation = ValidationHelper.validateRequired(requiredFields);

    if (!validation.valid) {
      return NextResponse.json(
        ResponseHelper.error('VALIDATION_ERROR', 'Email e senha são obrigatórios', 400, {
          errors: validation.errors,
        }),
        { status: 400 }
      );
    }

    // Get client info
    const userAgent = SecurityHelper.getUserAgent(request.headers);
    const ipAddress = SecurityHelper.getClientIP(request.headers);

    // Login
    const result = await LoginService.login(
      ValidationHelper.sanitizeEmail(email),
      password,
      userAgent || undefined,
      ipAddress,
      rememberMe === true
    );

    console.log('[AUTH] Login bem-sucedido:', email);

    // Set refresh token as httpOnly cookie
    const response = NextResponse.json(
      ResponseHelper.success(
        {
          user: result.user,
          accessToken: result.accessToken,
        },
        'Login realizado com sucesso'
      ),
      { status: 200 }
    );

    response.cookies.set('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: rememberMe ? 7 * 24 * 60 * 60 : 24 * 60 * 60, // 7 days or 1 day
      path: '/',
    });

    return response;
  } catch (error) {
    if (error instanceof AuthError) {
      console.warn('[AUTH] Login falhou:', error.message);

      return NextResponse.json(
        ResponseHelper.error(error.code, error.message, error.statusCode, error.details),
        { status: error.statusCode }
      );
    }

    console.error('[AUTH] Erro ao fazer login:', error);

    return NextResponse.json(
      ResponseHelper.error('INTERNAL_ERROR', 'Erro ao fazer login', 500),
      { status: 500 }
    );
  }
}
