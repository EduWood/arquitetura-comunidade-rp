import { NextRequest, NextResponse } from 'next/server';
import { verificarToken } from '@/lib/auth/token-verification';
import { AuthService } from '@/lib/auth/auth-service';
import { ResponseHelper } from '@/lib/auth/helpers';

// GET /api/auth/me — retorna o perfil do usuário autenticado
export async function GET(request: NextRequest) {
  try {
    // Verificar token diretamente do header
    const tokenResult = await verificarToken(request);

    if (!tokenResult.valid || !tokenResult.usuarioId) {
      return NextResponse.json(
        ResponseHelper.error('UNAUTHORIZED', 'Não autenticado', 401),
        { status: 401 }
      );
    }

    const userProfile = await AuthService.getUserProfile(tokenResult.usuarioId);

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
