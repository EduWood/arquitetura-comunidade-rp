// GET /api/courses/[id]/access - Verificar acesso
// POST /api/courses/[id]/start - Iniciar curso

import { NextRequest, NextResponse } from 'next/server';
import { verificarToken } from '@/lib/auth/token-verification';
import { extractRequestInfo } from '@/lib/request-info';
import { CourseAccessService } from '@/lib/member/course-access-service';
import { CourseProgressService } from '@/lib/member/course-progress-service';

/**
 * GET /api/courses/[id]/access - Verificar se pode acessar curso
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params;
    const tokenResult = await verificarToken(request);

    if (!tokenResult.valid) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const temAcesso = await CourseAccessService.canAccessCourse(
      tokenResult.usuarioId!,
      courseId
    );

    return NextResponse.json({
      success: true,
      data: {
        pode_acessar: temAcesso,
      },
    });
  } catch (error) {
    console.error('[GET /api/courses/[id]/access] Erro:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

/**
 * POST /api/courses/[id]/start - Iniciar um curso
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params;
    const tokenResult = await verificarToken(request);

    if (!tokenResult.valid) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const requestInfo = extractRequestInfo(request);

    // Verificar acesso
    const temAcesso = await CourseAccessService.canAccessCourse(
      tokenResult.usuarioId!,
      courseId
    );

    if (!temAcesso) {
      return NextResponse.json(
        { error: 'Sem acesso ao curso' },
        { status: 403 }
      );
    }

    // Iniciar curso
    const resultado = await CourseProgressService.startCourse(
      tokenResult.usuarioId!,
      courseId,
      requestInfo.ip,
      requestInfo.userAgent
    );

    return NextResponse.json(resultado, {
      status: resultado.success ? 200 : 400,
    });
  } catch (error) {
    console.error('[POST /api/courses/[id]/start] Erro:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
