// PUT /api/cms/seccoes/:nome - Atualizar seção específica

import { NextRequest, NextResponse } from 'next/server';
import { CMSService } from '@/lib/cms/cms-service';
import { verificarToken } from '@/lib/auth/token-verification';
import { verificarPermissao } from '@/lib/auth/permission-checker';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ nome: string }> }
) {
  try {
    const { nome } = await params;

    if (!nome) {
      return NextResponse.json(
        { error: 'Nome da seção é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar autenticação
    const tokenResult = await verificarToken(request);
    if (!tokenResult.valid) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Verificar permissão ADMIN
    const temPermissao = await verificarPermissao(
      tokenResult.usuarioId!,
      'ADMIN'
    );
    if (!temPermissao) {
      return NextResponse.json(
        { error: 'Sem permissão para editar CMS' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { conteudo } = body;

    if (!conteudo || typeof conteudo !== 'object') {
      return NextResponse.json(
        { error: 'Conteúdo inválido' },
        { status: 400 }
      );
    }

    const resultado = await CMSService.atualizarSecao(
      nome,
      conteudo,
      tokenResult.usuarioId!
    );

    if (!resultado.success) {
      return NextResponse.json(resultado, { status: 400 });
    }

    return NextResponse.json(resultado, { status: 200 });
  } catch (error) {
    console.error('[PUT /api/cms/seccoes] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar seção' },
      { status: 500 }
    );
  }
}
