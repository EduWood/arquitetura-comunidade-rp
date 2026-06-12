// POST /api/materials - Upload de material (ADMIN)

import { NextRequest, NextResponse } from 'next/server';
import { verificarAdminCMS } from '@/lib/cms/middleware';
import { MaterialService } from '@/lib/member/material-service';
import { CreateMaterialSchema } from '@/lib/member/types';

/**
 * POST /api/materials - Upload de material (ADMIN)
 */
export async function POST(request: NextRequest) {
  try {
    // Apenas ADMIN pode fazer upload de materiais
    const auth = await verificarAdminCMS(request);
    if (!auth.valid) return auth.response!;

    const body = await request.json();
    const validacao = CreateMaterialSchema.safeParse(body);

    if (!validacao.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validacao.error?.errors },
        { status: 400 }
      );
    }

    const resultado = await MaterialService.criar(
      validacao.data,
      auth.usuarioId!,
      auth.ip,
      auth.userAgent
    );

    return NextResponse.json(resultado, {
      status: resultado.success ? 201 : 400,
    });
  } catch (error) {
    console.error('[POST /api/materials] Erro:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
