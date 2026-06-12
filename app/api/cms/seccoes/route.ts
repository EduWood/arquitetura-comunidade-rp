// GET /api/cms/seccoes - Listar todas as seções

import { NextRequest, NextResponse } from 'next/server';
import { CMSService } from '@/lib/cms/cms-service';

export async function GET(request: NextRequest) {
  try {
    const resultado = await CMSService.listarSecoes('pagina-principal');

    return NextResponse.json(resultado, { status: 200 });
  } catch (error) {
    console.error('[GET /api/cms/seccoes] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao listar seções' },
      { status: 500 }
    );
  }
}
