import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { AuthService } from '@/lib/auth/auth-service';
import { ResponseHelper } from '@/lib/auth/helpers';

// GET /api/auth/me — alias para /api/auth/profile, usado pelo useAuth hook
export async function GET(request: NextRequest) {
  try {
    const { error, user } = await requireAuth(request);

    if (error || !user) {
      return NextResponse.json(
        ResponseHelper.error('UNAUTHORIZED', 'Não autenticado', 401),
        { status: 401 }
      );
    }

    const userProfile = await AuthService.getUserProfile(user.userId);

    return NextResponse.json(
      ResponseHelper.success(userProfile, 'Perfil carregado'),
      { status: 200 }
    );
  } catch (error) {
    console.error('[GET /api/auth/me] Erro:', error);
    return NextResponse.json(
      ResponseHelper.error('INTERNAL_ERROR', 'Erro ao carregar sessão', 500),
      { status: 500 }
    );
  }
}
