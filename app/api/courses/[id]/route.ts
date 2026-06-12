// GET /api/courses/[id] - Get course details
// PUT /api/courses/[id] - Update course
// DELETE /api/courses/[id] - Delete course

import { NextRequest, NextResponse } from 'next/server';
import { CourseService } from '@/lib/course/course-service';
import { UpdateCursoSchema } from '@/lib/course/types';
import { verificarAdminCMS } from '@/lib/cms/middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const resultado = await CourseService.obter(id);

    if (!resultado.success) {
      return NextResponse.json(resultado, { status: 404 });
    }

    return NextResponse.json(resultado);
  } catch (error) {
    console.error('[GET /api/courses/[id]] Erro:', error);
    return NextResponse.json({ error: 'Erro ao obter curso' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verificarAdminCMS(request);
    if (!auth.valid) return auth.response!;

    const { id } = await params;
    const body = await request.json();
    const dados = UpdateCursoSchema.parse(body);

    const resultado = await CourseService.atualizar(
      id,
      dados,
      auth.usuarioId!,
      auth.ip,
      auth.userAgent
    );

    return NextResponse.json(resultado);
  } catch (error) {
    console.error('[PUT /api/courses/[id]] Erro:', error);
    return NextResponse.json({ error: 'Erro ao atualizar curso' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verificarAdminCMS(request);
    if (!auth.valid) return auth.response!;

    const { id } = await params;

    const resultado = await CourseService.deletar(
      id,
      auth.usuarioId!,
      auth.ip,
      auth.userAgent
    );

    return NextResponse.json(resultado);
  } catch (error) {
    console.error('[DELETE /api/courses/[id]] Erro:', error);
    return NextResponse.json({ error: 'Erro ao deletar curso' }, { status: 500 });
  }
}
