// Media Cleanup Service - Identifica e limpa arquivos órfãos

import { prisma } from '@/lib/db';
import { HostingerUploadService } from './upload-service';

export interface OrphanFileReport {
  totalOrphanFiles: number;
  totalOrphanSize: number;
  files: Array<{
    id: string;
    nome_arquivo: string;
    caminho_relativo: string;
    tamanho_bytes: number;
    criado_em: Date;
    url_publica: string;
  }>;
}

export interface CleanupResult {
  success: boolean;
  filesDeleted: number;
  spaceRecovered: number;
  errors: Array<{
    arquivo: string;
    erro: string;
  }>;
}

export class MediaCleanupService {
  /**
   * Modo DRY RUN: Apenas analisa e reporta
   */
  static async dryRun(): Promise<OrphanFileReport> {
    try {
      // Encontrar imagens que não têm referência em CMSBlocoConteudo
      const orphanImages = await prisma.mediaImagem.findMany({
        where: {
          id: {
            notIn: (
              await prisma.cMSBlocoConteudo.findMany({
                where: { imagem_id: { not: null } },
                select: { imagem_id: true },
              })
            ).map((b) => b.imagem_id as string),
          },
        },
        orderBy: { criado_em: 'desc' },
      });

      const totalOrphanSize = orphanImages.reduce(
        (sum, img) => sum + (img.tamanho_bytes || 0),
        0
      );

      return {
        totalOrphanFiles: orphanImages.length,
        totalOrphanSize,
        files: orphanImages,
      };
    } catch (error) {
      console.error('[MediaCleanupService] Erro no dry run:', error);
      return {
        totalOrphanFiles: 0,
        totalOrphanSize: 0,
        files: [],
      };
    }
  }

  /**
   * Modo EXECUTION: Remove arquivo e registro
   */
  static async execute(): Promise<CleanupResult> {
    const result: CleanupResult = {
      success: true,
      filesDeleted: 0,
      spaceRecovered: 0,
      errors: [],
    };

    try {
      // 1. Encontrar órfãos
      const orphanReport = await this.dryRun();

      if (orphanReport.files.length === 0) {
        console.log('[MediaCleanupService] Nenhum arquivo órfão encontrado');
        return result;
      }

      console.log(
        `[MediaCleanupService] Limpando ${orphanReport.files.length} arquivos órfãos`
      );

      // 2. Remover cada arquivo
      for (const arquivo of orphanReport.files) {
        try {
          // Deletar do storage
          await HostingerUploadService.deletarArquivo(
            arquivo.caminho_relativo
          );

          // Deletar do banco
          await prisma.mediaImagem.delete({
            where: { id: arquivo.id },
          });

          result.filesDeleted++;
          result.spaceRecovered += arquivo.tamanho_bytes;

          console.log(
            `[MediaCleanupService] Deletado: ${arquivo.nome_arquivo}`
          );
        } catch (error) {
          result.errors.push({
            arquivo: arquivo.nome_arquivo,
            erro: (error as Error).message,
          });
          console.error(
            `[MediaCleanupService] Erro ao deletar ${arquivo.nome_arquivo}:`,
            error
          );
        }
      }

      return result;
    } catch (error) {
      console.error('[MediaCleanupService] Erro na limpeza:', error);
      result.success = false;
      return result;
    }
  }

  /**
   * Gerar relatório detalhado
   */
  static async generateReport(): Promise<{
    timestamp: Date;
    dryRun: OrphanFileReport;
    estimatedRecovery: {
      files: number;
      bytes: number;
      human: string;
    };
  }> {
    const dryRun = await this.dryRun();

    return {
      timestamp: new Date(),
      dryRun,
      estimatedRecovery: {
        files: dryRun.totalOrphanFiles,
        bytes: dryRun.totalOrphanSize,
        human: this.formatBytes(dryRun.totalOrphanSize),
      },
    };
  }

  /**
   * Formatar bytes para leitura humana
   */
  private static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}
