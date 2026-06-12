// GET /api/cron/daily-maintenance - Cron job para manutenção diária (03:00 AM)

import { NextRequest, NextResponse } from 'next/server';
import { MediaCleanupService } from '@/lib/cms/media-cleanup-service';
import { StorageIntegrityService } from '@/lib/cms/storage-integrity-service';
import { prisma } from '@/lib/db';

// Skip static generation - always dynamic
export const dynamic = 'force-dynamic';

/**
 * Verificar token secreto do cron
 */
function verificarTokenCron(request: NextRequest): boolean {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  const cronToken = process.env.CRON_SECRET_TOKEN;

  if (!cronToken) {
    console.warn('[CRON] CRON_SECRET_TOKEN não configurado');
    return false;
  }

  return token === cronToken;
}

export async function GET(request: NextRequest) {
  try {
    // Verificar token secreto
    if (!verificarTokenCron(request)) {
      console.warn('[CRON] Acesso não autorizado');
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    console.log('[CRON] Iniciando manutenção diária...');
    const resultado: {
      cleanup?: any;
      integrity?: any;
      timestamp: string;
      status: string;
    } = {
      timestamp: new Date().toISOString(),
      status: 'running',
    };

    // 1. Executar limpeza de órfãos
    try {
      console.log('[CRON] Executando limpeza de arquivos órfãos...');
      const cleanupResult = await MediaCleanupService.execute();
      resultado.cleanup = cleanupResult;

      // Registrar em log
      await prisma.logAuditoria.create({
        data: {
          usuario_id: null,
          acao: 'CRON_CLEANUP_DAILY',
          tabela_afetada: 'MediaImagem',
          valores_depois: JSON.stringify({
            filesDeleted: cleanupResult.filesDeleted,
            spaceRecovered: cleanupResult.spaceRecovered,
          }),
        },
      });

      console.log(`[CRON] Limpeza concluída: ${cleanupResult.filesDeleted} arquivos deletados`);
    } catch (error) {
      console.error('[CRON] Erro na limpeza:', error);
      resultado.cleanup = { error: (error as Error).message };
    }

    // 2. Verificar integridade
    try {
      console.log('[CRON] Verificando integridade de storage...');
      const integrityReport = await StorageIntegrityService.verifyIntegrity();
      resultado.integrity = integrityReport;

      // Registrar em log
      await prisma.logAuditoria.create({
        data: {
          usuario_id: null,
          acao: 'CRON_INTEGRITY_CHECK_DAILY',
          tabela_afetada: 'MediaImagem',
          valores_depois: JSON.stringify({
            issuesFound: integrityReport.issuesFound,
            missingFiles: integrityReport.summary.missingFiles,
            sizeMismatches: integrityReport.summary.sizeMismatches,
          }),
        },
      });

      console.log(
        `[CRON] Integridade verificada: ${integrityReport.issuesFound} problemas encontrados`
      );
    } catch (error) {
      console.error('[CRON] Erro na verificação:', error);
      resultado.integrity = { error: (error as Error).message };
    }

    resultado.status = 'completed';

    console.log('[CRON] Manutenção diária concluída');

    return NextResponse.json(resultado, { status: 200 });
  } catch (error) {
    console.error('[CRON] Erro geral:', error);
    return NextResponse.json(
      {
        error: 'Erro na manutenção diária',
        timestamp: new Date().toISOString(),
        status: 'failed',
      },
      { status: 500 }
    );
  }
}
