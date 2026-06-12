// POST /api/certificates - Gerar certificado

import { NextRequest, NextResponse } from 'next/server';
import { verificarToken } from '@/lib/auth/token-verification';
import { extractRequestInfo } from '@/lib/request-info';
import { CertificateService } from '@/lib/member/certificate-service';

// Skip static generation - always dynamic
export const dynamic = 'force-dynamic';

/**
 * POST /api/certificates - Gerar certificado
 */
export async function POST(request: NextRequest) {
  try {
    const tokenResult = await verificarToken(request);

    if (!tokenResult.valid) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { curso_id } = body;

    if (!curso_id) {
      return NextResponse.json(
        { error: 'ID do curso obrigatório' },
        { status: 400 }
      );
    }

    const requestInfo = extractRequestInfo(request);

    const resultado = await CertificateService.generateCertificate(
      tokenResult.usuarioId!,
      curso_id,
      tokenResult.usuarioId!,
      requestInfo.ip,
      requestInfo.userAgent
    );

    return NextResponse.json(resultado, {
      status: resultado.success ? 201 : 400,
    });
  } catch (error) {
    console.error('[POST /api/certificates] Erro:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
