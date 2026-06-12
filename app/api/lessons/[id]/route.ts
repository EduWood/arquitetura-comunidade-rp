// POST /api/lessons/[id]/complete - Marcar como concluída
// POST /api/lessons/[id]/uncomplete - Desmarcar como concluída
// POST /api/lessons/[id]/position - Salvar posição do vídeo

import { NextRequest, NextResponse } from 'next/server';
import { verificarToken } from '@/lib/auth/token-verification';
import { extractRequestInfo } from '@/lib/request-info';
import { CourseProgressService } from '@/lib/member/course-progress-service';
import { ContinueWatchingService } from '@/lib/member/continue-watching-service';
import {
  MarkLessonCompleteSchema,
  SavePositionSchema,
} from '@/lib/member/types';

/**
 * POST /api/lessons/[id]/complete - Marcar aula como concluída
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: lessonId } = await params;
    const tokenResult = await verificarToken(request);

    if (!tokenResult.valid) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const requestInfo = extractRequestInfo(request);
    const url = new URL(request.url);
    const action = url.pathname.split('/').pop();

    if (action === 'complete') {
      const resultado = await CourseProgressService.markLessonComplete(
        tokenResult.usuarioId!,
        lessonId,
        requestInfo.ip,
        requestInfo.userAgent
      );

      return NextResponse.json(resultado, {
        status: resultado.success ? 200 : 400,
      });
    }

    if (action === 'uncomplete') {
      const resultado = await CourseProgressService.unmarkLessonComplete(
        tokenResult.usuarioId!,
        lessonId,
        requestInfo.ip,
        requestInfo.userAgent
      );

      return NextResponse.json(resultado, {
        status: resultado.success ? 200 : 400,
      });
    }

    if (action === 'position') {
      const body = await request.json();
      const validacao = SavePositionSchema.safeParse(body);

      if (!validacao.success) {
        return NextResponse.json(
          { error: 'Dados inválidos', details: validacao.error?.errors },
          { status: 400 }
        );
      }

      const resultado = await ContinueWatchingService.savePosition(
        tokenResult.usuarioId!,
        lessonId,
        validacao.data.timestamp_segundos,
        validacao.data.progresso_percentual
      );

      return NextResponse.json(resultado);
    }

    return NextResponse.json(
      { error: 'Ação não reconhecida' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[POST /api/lessons/[id]/*] Erro:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

/**
 * Rotear DELETE, PATCH também se necessário
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Mesmo comportamento do POST para rotas alternativas
  return POST(request, { params });
}
