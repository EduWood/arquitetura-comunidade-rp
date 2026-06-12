import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAuth } from '@/lib/auth/verify-auth';

// Skip static generation - always dynamic
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const auth = await verifyAuth();
    if (!auth) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se é admin
    if (auth.usuario.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Obter parâmetros
    const { searchParams } = new URL(request.url);
    const limite = parseInt(searchParams.get('limite') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // TODO: Implementar auditoria quando modelo estiver disponível
    // Por enquanto, retornar resposta vazia

    return NextResponse.json({
      success: true,
      data: [],
      paginacao: {
        total: 0,
        limite,
        offset,
        paginas: 0,
      },
      mensagem: 'Auditoria não implementada ainda',
    });
  } catch (error) {
    console.error('[Admin Auditoria] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar auditoria' },
      { status: 500 }
    );
  }
}
