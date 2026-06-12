// GET /api/me/courses - Obter cursos do usuário
// GET /api/me/dashboard - Dashboard completo
// GET /api/me/progress - Progresso geral
// GET /api/me/continue-watching - Continuar assistindo

import { NextRequest, NextResponse } from 'next/server';
import { verificarToken } from '@/lib/auth/token-verification';
import { extractRequestInfo } from '@/lib/request-info';
import { CourseAccessService } from '@/lib/member/course-access-service';
import { DashboardService } from '@/lib/member/dashboard-service';
import { CourseProgressService } from '@/lib/member/course-progress-service';
import { ContinueWatchingService } from '@/lib/member/continue-watching-service';

/**
 * GET /api/me/courses - Obter todos os cursos do usuário
 */
export async function GET(request: NextRequest) {
  try {
    const tokenResult = await verificarToken(request);

    if (!tokenResult.valid) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const url = new URL(request.url);
    const endpoint = url.pathname.split('/').pop();

    const requestInfo = extractRequestInfo(request);

    // Rotear para diferentes endpoints
    if (endpoint === 'courses') {
      const skip = parseInt(url.searchParams.get('skip') || '0');
      const take = parseInt(url.searchParams.get('take') || '10');

      const resultado = await CourseAccessService.getUserCourses(
        tokenResult.usuarioId!,
        skip,
        take
      );

      return NextResponse.json(resultado);
    }

    if (endpoint === 'dashboard') {
      const resultado = await DashboardService.getDashboardData(tokenResult.usuarioId!);

      return NextResponse.json(resultado);
    }

    if (endpoint === 'progress') {
      const resultado = await CourseProgressService.getUserProgress(tokenResult.usuarioId!);

      return NextResponse.json(resultado);
    }

    if (endpoint === 'continue-watching') {
      const limit = parseInt(url.searchParams.get('limit') || '5');
      const resultado = await ContinueWatchingService.getContinueWatching(
        tokenResult.usuarioId!,
        limit
      );

      return NextResponse.json(resultado);
    }

    return NextResponse.json({ error: 'Endpoint não encontrado' }, { status: 404 });
  } catch (error) {
    console.error('[GET /api/me/*] Erro:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
