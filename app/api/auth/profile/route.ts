import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/auth-service';
import { requireAuth } from '@/lib/auth/middleware';
import { ResponseHelper } from '@/lib/auth/helpers';
import { AuthError } from '@/lib/auth/errors';

// ========================================
// GET /api/auth/profile
// ========================================

export async function GET(request: NextRequest) {
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

    const userProfile = await AuthService.getUserProfile(user.userId);

    return NextResponse.json(
      ResponseHelper.success(userProfile, 'Perfil carregado com sucesso'),
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        ResponseHelper.error(error.code, error.message, error.statusCode),
        { status: error.statusCode }
      );
    }

    console.error('[AUTH] Erro ao carregar perfil:', error);

    return NextResponse.json(
      ResponseHelper.error('INTERNAL_ERROR', 'Erro ao carregar perfil', 500),
      { status: 500 }
    );
  }
}

// ========================================
// PUT /api/auth/profile
// ========================================

export async function PUT(request: NextRequest) {
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
    const { nome, email } = body;

    const updatedProfile = await AuthService.updateUserProfile(user.userId, {
      nome,
      email,
    });

    console.log('[AUTH] Perfil atualizado:', user.email);

    return NextResponse.json(
      ResponseHelper.success(updatedProfile, 'Perfil atualizado com sucesso'),
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        ResponseHelper.error(error.code, error.message, error.statusCode),
        { status: error.statusCode }
      );
    }

    console.error('[AUTH] Erro ao atualizar perfil:', error);

    return NextResponse.json(
      ResponseHelper.error('INTERNAL_ERROR', 'Erro ao atualizar perfil', 500),
      { status: 500 }
    );
  }
}
