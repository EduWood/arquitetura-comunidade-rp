import { NextRequest, NextResponse } from 'next/server';
import { RegisterService } from '@/lib/auth/register-service';
import { ValidationHelper, ResponseHelper, SecurityHelper } from '@/lib/auth/helpers';
import { AuthError } from '@/lib/auth/errors';
import { validateCORSMiddleware } from '@/lib/cors';

// Skip static generation - always dynamic
export const dynamic = 'force-dynamic';

// ========================================
// POST /api/auth/register
// ========================================

export async function POST(request: NextRequest) {
  try {
    // Validate CORS
    const corsValidation = await validateCORSMiddleware(request);
    if (!corsValidation.isValid) {
      return corsValidation.response!;
    }

    const body = await request.json();
    const { nome, email, password, confirmPassword } = body;

    // Validations
    const requiredFields = { nome, email, password, confirmPassword };
    const validation = ValidationHelper.validateRequired(requiredFields);

    if (!validation.valid) {
      return NextResponse.json(
        ResponseHelper.error('VALIDATION_ERROR', 'Campos obrigatórios faltando', 400, {
          errors: validation.errors,
        }),
        { status: 400 }
      );
    }

    // Get client info
    const userAgent = SecurityHelper.getUserAgent(request.headers) || 'unknown';
    const ipAddress = SecurityHelper.getClientIP(request.headers);

    // Register user
    const user = await RegisterService.register(
      ValidationHelper.sanitizeName(nome),
      ValidationHelper.sanitizeEmail(email),
      password,
      confirmPassword,
      ipAddress,
      userAgent
    );

    return NextResponse.json(
      ResponseHelper.success(user, 'Usuário registrado com sucesso'),
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        ResponseHelper.error(error.code, error.message, error.statusCode, error.details),
        { status: error.statusCode }
      );
    }

    console.error('[AUTH] Erro ao registrar:', error);

    return NextResponse.json(
      ResponseHelper.error('INTERNAL_ERROR', 'Erro ao registrar usuário', 500),
      { status: 500 }
    );
  }
}
