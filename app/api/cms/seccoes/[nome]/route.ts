// GET /api/cms/seccoes/:nome - Obter seção específica

import { NextRequest, NextResponse } from 'next/server';
import { CMSService } from '@/lib/cms/cms-service';

export async function GET(
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

    const resultado = await CMSService.getSecao(nome, 'HERO' as any);

    return NextResponse.json(resultado, { status: 200 });
  } catch (error) {
    console.error('[GET /api/cms/seccoes] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao obter seção' },
      { status: 500 }
    );
  }
}
