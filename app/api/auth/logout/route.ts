import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth/middleware';
import { ResponseHelper, SecurityHelper } from '@/lib/auth/helpers';
import { auditLogout } from '@/lib/audit-logger';

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

    // Get client info
    const ipAddress = SecurityHelper.getClientIP(request.headers);
    const userAgent = SecurityHelper.getUserAgent(request.headers) || 'unknown';

    // Revoke session
    await prisma.sessaoJWT.updateMany({
      where: { usuario_id: user.userId, revogado: false },
      data: { revogado: true },
    });

    // Audit log
    await auditLogout(user.userId, ipAddress, userAgent);

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
