// POST /api/cms/maintenance/cleanup - Limpeza de arquivos órfãos

import { NextRequest, NextResponse } from 'next/server';
import { verificarAdminCMS } from '@/lib/cms/middleware';
import { MediaCleanupService } from '@/lib/cms/media-cleanup-service';
import { auditLog } from '@/lib/audit-logger';

// Skip static generation - always dynamic
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const auth = await verificarAdminCMS(request);
    if (!auth.valid) {
      return auth.response || NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const mode = body.mode || 'dryrun'; // 'dryrun' ou 'execute'

    if (mode === 'dryrun') {
      const report = await MediaCleanupService.generateReport();

      await auditLog({
        usuario_id: auth.usuarioId,
        acao: 'CMS_CLEANUP_DRYRUN',
        tabela_afetada: 'MediaImagem',
        ip_address: auth.ip,
        user_agent: auth.userAgent,
        valores_depois: {
          orphanFiles: report.dryRun.totalOrphanFiles,
          spaceRecoverable: report.estimatedRecovery.human,
        },
      });

      return NextResponse.json(
        {
          mode: 'dryrun',
          report,
        },
        { status: 200 }
      );
    } else if (mode === 'execute') {
      const result = await MediaCleanupService.execute();

      await auditLog({
        usuario_id: auth.usuarioId,
        acao: 'CMS_CLEANUP_EXECUTE',
        tabela_afetada: 'MediaImagem',
        ip_address: auth.ip,
        user_agent: auth.userAgent,
        valores_depois: {
          filesDeleted: result.filesDeleted,
          spaceRecovered: result.spaceRecovered,
          errors: result.errors.length,
        },
      });

      return NextResponse.json(
        {
          mode: 'execute',
          result,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: "Mode deve ser 'dryrun' ou 'execute'" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('[POST /api/cms/maintenance/cleanup] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao executar limpeza' },
      { status: 500 }
    );
  }
}
