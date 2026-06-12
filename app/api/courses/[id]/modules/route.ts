// GET /api/courses/[id]/modules - List modules
// POST /api/courses/[id]/modules - Create module

import { NextRequest, NextResponse } from 'next/server';
import { ModuleService } from '@/lib/course/module-service';
import { CreateModuloSchema } from '@/lib/course/types';
import { verificarAdminCMS } from '@/lib/cms/middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: cursoId } = await params;

    const resultado = await ModuleService.listarPorCurso(cursoId);
    return NextResponse.json(resultado);
  } catch (error) {
    console.error('[GET /api/courses/[id]/modules] Erro:', error);
    return NextResponse.json({ error: 'Erro ao listar módulos' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verificarAdminCMS(request);
    if (!auth.valid) return auth.response!;

    const { id: cursoId } = await params;
    const body = await request.json();

    // Adicionar curso_id aos dados
    const dados = CreateModuloSchema.parse({ ...body, curso_id: cursoId });

    const resultado = await ModuleService.criar(
      dados,
      auth.usuarioId!,
      auth.ip,
      auth.userAgent
    );

    return NextResponse.json(resultado, { status: 201 });
  } catch (error) {
    console.error('[POST /api/courses/[id]/modules] Erro:', error);
    return NextResponse.json({ error: 'Erro ao criar módulo' }, { status: 500 });
  }
}
