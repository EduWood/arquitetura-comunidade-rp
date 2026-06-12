// GET /api/cms/maintenance/integrity - Verificação de integridade de storage

import { NextRequest, NextResponse } from 'next/server';
import { verificarAdminCMS } from '@/lib/cms/middleware';
import { StorageIntegrityService } from '@/lib/cms/storage-integrity-service';
import { auditLog } from '@/lib/audit-logger';

export async function GET(request: NextRequest) {
  try {
    const auth = await verificarAdminCMS(request);
    if (!auth.valid) {
      return auth.response || NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const report = await StorageIntegrityService.verifyIntegrity();

    await auditLog({
      usuario_id: auth.usuarioId,
      acao: 'CMS_INTEGRITY_CHECK',
      tabela_afetada: 'MediaImagem',
      ip_address: auth.ip,
      user_agent: auth.userAgent,
      valores_depois: {
        totalRecords: report.totalRecords,
        issuesFound: report.issuesFound,
        missingFiles: report.summary.missingFiles,
        sizeMismatches: report.summary.sizeMismatches,
      },
    });

    return NextResponse.json(
      {
        success: true,
        report,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[GET /api/cms/maintenance/integrity] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar integridade' },
      { status: 500 }
    );
  }
}

/**
 * POST - Reparar inconsistências (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await verificarAdminCMS(request);
    if (!auth.valid) {
      return auth.response || NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const dryRun = body.dryRun !== false; // Default true para segurança

    const resultado = await StorageIntegrityService.repairIssues(dryRun);

    await auditLog({
      usuario_id: auth.usuarioId,
      acao: dryRun ? 'CMS_REPAIR_DRYRUN' : 'CMS_REPAIR_EXECUTE',
      tabela_afetada: 'MediaImagem',
      ip_address: auth.ip,
      user_agent: auth.userAgent,
      valores_depois: {
        dryRun,
        repaired: resultado.repaired,
        skipped: resultado.skipped,
        errors: resultado.errors.length,
      },
    });

    return NextResponse.json(
      {
        success: resultado.success,
        dryRun: resultado.dryRun,
        repaired: resultado.repaired,
        skipped: resultado.skipped,
        errors: resultado.errors,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[POST /api/cms/maintenance/integrity] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao reparar integridade' },
      { status: 500 }
    );
  }
}
