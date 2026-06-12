// Upload Transaction Service - Garante integridade transacional em uploads

import { prisma } from '@/lib/db';
import { HostingerUploadService } from './upload-service';

export interface UploadTransaction {
  temporaryPath?: string;
  finalPath?: string;
  url?: string;
  filename?: string;
  mimeType?: string;
  size?: number;
  database?: {
    id: string;
    nome_original: string;
  };
}

export class UploadTransactionService {
  /**
   * Executar upload com segurança transacional
   * 
   * Fluxo:
   * 1. Upload para local temporário
   * 2. Criar registro no banco (transação)
   * 3. Mover para local definitivo
   * 4. Em caso de erro, fazer rollback
   */
  static async uploadComTransacao(
    arquivo: File,
    pasta: string,
    usuarioId: string,
    metadados?: Record<string, any>
  ): Promise<{
    success: boolean;
    data?: UploadTransaction;
    error?: string;
  }> {
    let temporaryPath: string | undefined;

    try {
      // STEP 1: Upload para local temporário
      const uploadResult = await HostingerUploadService.uploadArquivo(
        arquivo,
        'tmp'
      );

      if (!uploadResult.success) {
        return {
          success: false,
          error: uploadResult.error || 'Erro ao fazer upload',
        };
      }

      temporaryPath = uploadResult.path;

      // STEP 2: Criar registro no banco (dentro de transação)
      const dbResult = await prisma.$transaction(async (tx) => {
        // Criar registro em MediaImagem
        const imagem = await tx.mediaImagem.create({
          data: {
            nome_original: arquivo.name,
            nome_arquivo: uploadResult.filename!,
            caminho_relativo: temporaryPath!,
            url_publica: uploadResult.url!,
            tipo_mime: uploadResult.mimeType!,
            tamanho_bytes: uploadResult.size!,
            largura: (metadados?.largura as number) || undefined,
            altura: (metadados?.altura as number) || undefined,
          },
        });

        return imagem;
      });

      // STEP 3: Mover arquivo do temporário para definitivo
      const finalPath = `${pasta}/${uploadResult.filename}`;
      const moveResult = await HostingerUploadService.moverArquivo(
        temporaryPath!,
        finalPath
      );

      if (!moveResult.success) {
        // Rollback: Deletar registro do banco
        await prisma.mediaImagem.delete({
          where: { id: dbResult.id },
        });

        // Tentar deletar arquivo do temporário
        await HostingerUploadService.deletarArquivo(temporaryPath!).catch(
          (err) => {
            console.error('[UploadTransactionService] Erro ao limpar tmp:', err);
          }
        );

        return {
          success: false,
          error: 'Erro ao mover arquivo para destino final',
        };
      }

      return {
        success: true,
        data: {
          temporaryPath,
          finalPath,
          url: uploadResult.url,
          filename: uploadResult.filename,
          mimeType: uploadResult.mimeType,
          size: uploadResult.size,
          database: {
            id: dbResult.id,
            nome_original: dbResult.nome_original,
          },
        },
      };
    } catch (error) {
      console.error('[UploadTransactionService] Erro:', error);

      // Rollback: Limpar arquivo temporário se existir
      if (temporaryPath) {
        try {
          await HostingerUploadService.deletarArquivo(temporaryPath);
        } catch (cleanupError) {
          console.error(
            '[UploadTransactionService] Erro ao limpar arquivo órfão:',
            cleanupError
          );
        }
      }

      return {
        success: false,
        error: 'Erro ao processar upload',
      };
    }
  }

  /**
   * Verificar integridade de upload
   * Confirmar que arquivo e registro existem
   */
  static async verificarIntegridade(
    imagemId: string
  ): Promise<{
    consistent: boolean;
    arquivo?: boolean;
    registro?: boolean;
    detalhes?: string;
  }> {
    try {
      // Verificar registro no banco
      const registro = await prisma.mediaImagem.findUnique({
        where: { id: imagemId },
      });

      if (!registro) {
        return {
          consistent: false,
          registro: false,
          detalhes: 'Registro não existe no banco',
        };
      }

      // Verificar arquivo no storage
      const arquivoExiste = await HostingerUploadService.verificarArquivo(
        registro.caminho_relativo
      );

      if (!arquivoExiste) {
        return {
          consistent: false,
          arquivo: false,
          registro: true,
          detalhes: 'Arquivo não existe no storage',
        };
      }

      return {
        consistent: true,
        arquivo: true,
        registro: true,
        detalhes: 'Upload consistente',
      };
    } catch (error) {
      console.error('[UploadTransactionService] Erro ao verificar:', error);
      return {
        consistent: false,
        detalhes: 'Erro ao verificar integridade',
      };
    }
  }
}
