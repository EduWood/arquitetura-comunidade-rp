import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email-service';

export async function GET() {
  try {
    const validacao = await emailService.validar();

    if (validacao.funcional) {
      return NextResponse.json({
        sucesso: true,
        mensagem: 'Email service funcional',
        status: 'healthy',
      });
    } else {
      return NextResponse.json(
        {
          sucesso: false,
          mensagem: 'Email service não configurado',
          erro: validacao.erro,
          status: 'degraded',
        },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('[Email Check] Erro:', error);
    return NextResponse.json(
      {
        sucesso: false,
        mensagem: 'Erro ao verificar email service',
        erro: error instanceof Error ? error.message : 'Erro desconhecido',
        status: 'unhealthy',
      },
      { status: 500 }
    );
  }
}
