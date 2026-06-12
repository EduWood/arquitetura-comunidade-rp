// GET /api/materials/[id] - Download de material

import { NextRequest, NextResponse } from 'next/server';
import { verificarToken } from '@/lib/auth/token-verification';
import { extractRequestInfo } from '@/lib/request-info';
import { MaterialService } from '@/lib/member/material-service';

// Skip static generation - always dynamic
export const dynamic = 'force-dynamic';

/**
 * GET /api/materials/[id] - Download ou info do material
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: materialId } = await params;
    const tokenResult = await verificarToken(request);

    if (!tokenResult.valid) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const requestInfo = extractRequestInfo(request);

    // Obter info do material
    const resultado = await MaterialService.obter(materialId);

    if (!resultado.success) {
      return NextResponse.json(resultado, { status: 404 });
    }

    // Registrar download
    await MaterialService.registrarDownload(
      tokenResult.usuarioId!,
      materialId,
      requestInfo.ip,
      requestInfo.userAgent
    );

    return NextResponse.json(resultado);
  } catch (error) {
    console.error('[GET /api/materials/[id]] Erro:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
