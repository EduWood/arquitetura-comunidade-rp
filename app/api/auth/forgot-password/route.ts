import { NextRequest, NextResponse } from 'next/server';
import { ForgotPasswordService } from '@/lib/auth/forgot-password-service';
import { ValidationHelper, ResponseHelper, SecurityHelper } from '@/lib/auth/helpers';
import { validateCORSMiddleware } from '@/lib/cors';

// ========================================
// POST /api/auth/forgot-password
// ========================================

export async function POST(request: NextRequest) {
  try {
    // Validate CORS
    const corsValidation = await validateCORSMiddleware(request);
    if (!corsValidation.isValid) {
      return corsValidation.response!;
    }

    const body = await request.json();
    const { email } = body;

    // Validations
    if (!email) {
      return NextResponse.json(
        ResponseHelper.error('VALIDATION_ERROR', 'Email é obrigatório', 400),
        { status: 400 }
      );
    }

    if (!ValidationHelper.isValidEmail(email)) {
      return NextResponse.json(
        ResponseHelper.error('VALIDATION_ERROR', 'Email inválido', 400),
        { status: 400 }
      );
    }

    const ipAddress = SecurityHelper.getClientIP(request.headers);

    const result = await ForgotPasswordService.requestPasswordReset(
      ValidationHelper.sanitizeEmail(email),
      ipAddress
    );

    // Always return success for security (email enumeration prevention)
    return NextResponse.json(
      ResponseHelper.success(null, result.message),
      { status: 200 }
    );
  } catch (error) {
    console.error('[AUTH] Erro ao solicitar recuperação:', error);

    return NextResponse.json(
      ResponseHelper.error('INTERNAL_ERROR', 'Erro ao processar solicitação', 500),
      { status: 500 }
    );
  }
}
