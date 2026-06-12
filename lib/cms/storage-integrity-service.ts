// Storage Integrity Service - Verifica consistência entre banco e storage

import { prisma } from '@/lib/db';
import { HostingerUploadService } from './upload-service';

export interface IntegrityIssue {
  type: 'missing_file' | 'missing_record' | 'size_mismatch';
  id: string;
  arquivo: string;
  detalhes: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface IntegrityReport {
  timestamp: Date;
  totalRecords: number;
  totalFiles: number;
  issuesFound: number;
  issues: IntegrityIssue[];
  summary: {
    missingFiles: number;
    missingRecords: number;
    sizeMismatches: number;
  };
}

export class StorageIntegrityService {
  /**
   * Verificar integridade completa
   */
  static async verifyIntegrity(): Promise<IntegrityReport> {
    const issues: IntegrityIssue[] = [];
    const report: IntegrityReport = {
      timestamp: new Date(),
      totalRecords: 0,
      totalFiles: 0,
      issuesFound: 0,
      issues,
      summary: {
        missingFiles: 0,
        missingRecords: 0,
        sizeMismatches: 0,
      },
    };

    try {
      // 1. Verificar registros no banco que não existem no storage
      const registros = await prisma.mediaImagem.findMany();
      report.totalRecords = registros.length;

      for (const registro of registros) {
        try {
          const existe = await HostingerUploadService.verificarArquivo(
            registro.caminho_relativo
          );

          if (!existe) {
            const issue: IntegrityIssue = {
              type: 'missing_file',
              id: registro.id,
              arquivo: registro.nome_arquivo,
              detalhes: `Arquivo não encontrado no storage: ${registro.caminho_relativo}`,
              severity: 'critical',
            };
            issues.push(issue);
            report.summary.missingFiles++;
          }

          // 2. Verificar tamanho do arquivo se existir
          if (existe && registro.tamanho_bytes && registro.tamanho_bytes > 0) {
            const tamanho = await HostingerUploadService.obterTamanhoArquivo(
              registro.caminho_relativo
            );

            if (tamanho !== null && tamanho !== registro.tamanho_bytes) {
              const issue: IntegrityIssue = {
                type: 'size_mismatch',
                id: registro.id,
                arquivo: registro.nome_arquivo,
                detalhes: `Tamanho divergente. Banco: ${registro.tamanho_bytes} bytes, Storage: ${tamanho} bytes`,
                severity: 'warning',
              };
              issues.push(issue);
              report.summary.sizeMismatches++;
            }
          }
        } catch (error) {
          console.error(
            `[StorageIntegrityService] Erro ao verificar ${registro.nome_arquivo}:`,
            error
          );
          const issue: IntegrityIssue = {
            type: 'missing_file',
            id: registro.id,
            arquivo: registro.nome_arquivo,
            detalhes: `Erro ao verificar arquivo: ${(error as Error).message}`,
            severity: 'warning',
          };
          issues.push(issue);
        }
      }

      report.issuesFound = issues.length;

      // Verificar se há arquivos no storage que não estão no banco
      // (requer implementação no HostingerUploadService para listar arquivos)
      // TODO: Implementar listagem de arquivos no storage

      return report;
    } catch (error) {
      console.error('[StorageIntegrityService] Erro na verificação:', error);
      return report;
    }
  }

  /**
   * Reparar inconsistências (modo seguro)
   */
  static async repairIssues(
    dryRun: boolean = true
  ): Promise<{
    success: boolean;
    dryRun: boolean;
    repaired: number;
    skipped: number;
    errors: string[];
  }> {
    const resultado = {
      success: true,
      dryRun,
      repaired: 0,
      skipped: 0,
      errors: [] as string[],
    };

    try {
      const report = await this.verifyIntegrity();

      for (const issue of report.issues) {
        try {
          if (issue.type === 'missing_file') {
            if (dryRun) {
              console.log(
                `[DRY RUN] Deletaria registro órfão: ${issue.arquivo}`
              );
              resultado.skipped++;
            } else {
              // Deletar registro órfão
              await prisma.mediaImagem.delete({
                where: { id: issue.id },
              });
              resultado.repaired++;
              console.log(`[REPAIR] Deletado registro órfão: ${issue.arquivo}`);
            }
          } else if (issue.type === 'size_mismatch') {
            if (dryRun) {
              console.log(
                `[DRY RUN] Corrigiria tamanho: ${issue.arquivo}`
              );
              resultado.skipped++;
            } else {
              // Atualizar tamanho no banco
              const tamanho = await HostingerUploadService.obterTamanhoArquivo(
                issue.id
              );
              if (tamanho) {
                await prisma.mediaImagem.update({
                  where: { id: issue.id },
                  data: { tamanho_bytes: tamanho },
                });
                resultado.repaired++;
                console.log(`[REPAIR] Tamanho corrigido: ${issue.arquivo}`);
              }
            }
          }
        } catch (error) {
          const errorMsg = `Erro ao reparar ${issue.arquivo}: ${(error as Error).message}`;
          resultado.errors.push(errorMsg);
          console.error(`[StorageIntegrityService] ${errorMsg}`);
        }
      }

      return resultado;
    } catch (error) {
      console.error('[StorageIntegrityService] Erro no reparo:', error);
      resultado.success = false;
      resultado.errors.push((error as Error).message);
      return resultado;
    }
  }

  /**
   * Gerar relatório em formato legível
   */
  static async generateHumanReadableReport(): Promise<string> {
    const report = await this.verifyIntegrity();

    let output = `
╔════════════════════════════════════════╗
║   RELATÓRIO DE INTEGRIDADE DE STORAGE  ║
╚════════════════════════════════════════╝

Data/Hora: ${report.timestamp.toLocaleString('pt-BR')}

ESTATÍSTICAS:
  • Total de registros no banco: ${report.totalRecords}
  • Problemas encontrados: ${report.issuesFound}
  
RESUMO:
  • Arquivos faltando no storage: ${report.summary.missingFiles}
  • Tamanhos divergentes: ${report.summary.sizeMismatches}

DETALHES DOS PROBLEMAS:
`;

    if (report.issues.length === 0) {
      output += '\n  ✓ Nenhum problema encontrado!';
    } else {
      for (let i = 0; i < report.issues.length; i++) {
        const issue = report.issues[i];
        const icon = issue.severity === 'critical' ? '✗' : '⚠';
        output += `\n  ${i + 1}. [${issue.severity.toUpperCase()}] ${icon} ${issue.arquivo}`;
        output += `\n     ${issue.detalhes}`;
      }
    }

    output += '\n';

    return output;
  }
}
