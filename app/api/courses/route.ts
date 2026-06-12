// GET /api/courses - List all courses
// POST /api/courses - Create course

import { NextRequest, NextResponse } from 'next/server';
import { CourseService } from '@/lib/course/course-service';
import { CreateCursoSchema } from '@/lib/course/types';
import { verificarAdminCMS } from '@/lib/cms/middleware';

export async function GET(request: NextRequest) {
  try {
    // Query parameters para filtros
    const { searchParams } = new URL(request.url);
    const categoria = searchParams.get('categoria') || undefined;
    const nivel = searchParams.get('nivel') || undefined;
    const skip = parseInt(searchParams.get('skip') || '0');
    const take = parseInt(searchParams.get('take') || '10');

    const resultado = await CourseService.listar({
      categoria: categoria as any,
      nivel: nivel as any,
      skip,
      take,
    });

    return NextResponse.json(resultado);
  } catch (error) {
    console.error('[GET /api/courses] Erro:', error);
    return NextResponse.json({ error: 'Erro ao listar cursos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação e permissão
    const auth = await verificarAdminCMS(request);
    if (!auth.valid) return auth.response!;

    const body = await request.json();
    const dados = CreateCursoSchema.parse(body);

    const resultado = await CourseService.criar(
      dados,
      auth.usuarioId!,
      auth.ip,
      auth.userAgent
    );

    return NextResponse.json(resultado, { status: 201 });
  } catch (error) {
    console.error('[POST /api/courses] Erro:', error);
    return NextResponse.json({ error: 'Erro ao criar curso' }, { status: 500 });
  }
}
