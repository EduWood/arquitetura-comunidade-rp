import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '@/lib/auth/middleware';
import { ResponseHelper } from '@/lib/auth/helpers';

const prisma = new PrismaClient();

// ========================================
// POST /api/auth/logout
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

    // Deactivate session
    await prisma.sessaoJWT.updateMany({
      where: { usuarioId: user.userId, ativa: true },
      data: { ativa: false },
    });

    console.log('[AUTH] Logout realizado:', user.email);

    const response = NextResponse.json(
      ResponseHelper.success(null, 'Logout realizado com sucesso'),
      { status: 200 }
    );

    // Clear refresh token cookie
    response.cookies.set('refreshToken', '', {
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[AUTH] Erro ao fazer logout:', error);

    return NextResponse.json(
      ResponseHelper.error('INTERNAL_ERROR', 'Erro ao fazer logout', 500),
      { status: 500 }
    );
  }
}
