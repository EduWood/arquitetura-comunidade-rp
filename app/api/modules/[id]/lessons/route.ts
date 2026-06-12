// GET /api/modules/[id]/lessons - List lessons
// POST /api/modules/[id]/lessons - Create lesson

import { NextRequest, NextResponse } from 'next/server';
import { LessonService } from '@/lib/course/lesson-service';
import { CreateAulaSchema } from '@/lib/course/types';
import { verificarAdminCMS } from '@/lib/cms/middleware';

// Skip static generation - always dynamic
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: moduloId } = await params;

    const resultado = await LessonService.listarPorModulo(moduloId);
    return NextResponse.json(resultado);
  } catch (error) {
    console.error('[GET /api/modules/[id]/lessons] Erro:', error);
    return NextResponse.json({ error: 'Erro ao listar aulas' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verificarAdminCMS(request);
    if (!auth.valid) return auth.response!;

    const { id: moduloId } = await params;
    const body = await request.json();

    const dados = CreateAulaSchema.parse({ ...body, modulo_id: moduloId });

    const resultado = await LessonService.criar(
      dados,
      auth.usuarioId!,
      auth.ip,
      auth.userAgent
    );

    return NextResponse.json(resultado, { status: 201 });
  } catch (error) {
    console.error('[POST /api/modules/[id]/lessons] Erro:', error);
    return NextResponse.json({ error: 'Erro ao criar aula' }, { status: 500 });
  }
}
