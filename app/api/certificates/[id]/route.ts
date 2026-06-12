// GET /api/certificates/[id] - Obter/download certificado

import { NextRequest, NextResponse } from 'next/server';
import { verificarToken } from '@/lib/auth/token-verification';
import { extractRequestInfo } from '@/lib/request-info';
import { CertificateService } from '@/lib/member/certificate-service';

/**
 * GET /api/certificates/[id] - Obter/download certificado
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: certificadoId } = await params;
    const tokenResult = await verificarToken(request);

    if (!tokenResult.valid) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const requestInfo = extractRequestInfo(request);

    const resultado = await CertificateService.downloadCertificate(
      certificadoId,
      tokenResult.usuarioId!,
      requestInfo.ip,
      requestInfo.userAgent
    );

    return NextResponse.json(resultado);
  } catch (error) {
    console.error('[GET /api/certificates/[id]] Erro:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
