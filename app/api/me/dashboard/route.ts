import { NextRequest, NextResponse } from 'next/server';
import { verificarToken } from '@/lib/auth/token-verification';
import { ResponseHelper } from '@/lib/auth/helpers';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Verificar token
    const tokenResult = await verificarToken(request);
    
    if (!tokenResult.valid || !tokenResult.usuarioId) {
      return NextResponse.json(
        ResponseHelper.error('UNAUTHORIZED', 'Não autenticado', 401),
        { status: 401 }
      );
    }

    // Buscar dados do dashboard
    const usuario = await prisma.usuario.findUnique({
      where: { id: tokenResult.usuarioId },
      select: {
        nome: true,
        email: true,
      },
    });

    if (!usuario) {
      return NextResponse.json(
        ResponseHelper.error('NOT_FOUND', 'Usuário não encontrado', 404),
        { status: 404 }
      );
    }

    // Buscar estatísticas simples (sem dados reais por enquanto)
    const dashboardData = {
      nome: usuario.nome,
      email: usuario.email,
      total_cursos: 0,
      cursos_concluidos: 0,
      progresso_geral: 0,
      horas_estudo: 0,
      ultimos_cursos: [],
    };

    return NextResponse.json(
      ResponseHelper.success(dashboardData, 'Dashboard carregado'),
      { status: 200 }
    );
  } catch (erro) {
    console.error('[GET /api/me/dashboard] Erro:', erro);
    return NextResponse.json(
      ResponseHelper.error('INTERNAL_ERROR', 'Erro ao carregar dashboard', 500),
      { status: 500 }
    );
  }
}
