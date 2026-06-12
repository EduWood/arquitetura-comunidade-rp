// Media Delete Service - Remove mídia com verificação de referências

import { prisma } from '@/lib/db';
import { HostingerUploadService } from './upload-service';
import { auditLog } from '@/lib/audit-logger';

export interface MediaReference {
  type: 'CMSBlocoConteudo' | 'CMSDepoimento' | 'CMSPagina' | 'Desconhecido';
  id: string;
  descricao: string;
}

export interface MediaDeleteResult {
  success: boolean;
  deleted?: boolean;
  references?: MediaReference[];
  error?: string;
}

export class MediaDeleteService {
  /**
   * Verificar se mídia está sendo utilizada
   */
  static async verificarReferencias(
    imagemId: string
  ): Promise<MediaReference[]> {
    const referencias: MediaReference[] = [];

    try {
      // Verificar CMSBlocoConteudo
      const blocos = await prisma.cMSBlocoConteudo.findMany({
        where: { imagem_id: imagemId },
      });

      for (const bloco of blocos) {
        referencias.push({
          type: 'CMSBlocoConteudo',
          id: bloco.id,
          descricao: `Bloco de conteúdo: ${bloco.titulo}`,
        });
      }

      // Verificar CMSDepoimento (se houver campo de imagem)
      const depoimentos = await prisma.cMSDepoimento.findMany({
        where: {
          // Ajustar se houver campo de imagem diferente
        },
      });

      // Verificar CMSPagina (se houver campo de imagem)
      const paginas = await prisma.cMSPagina.findMany({
        where: {
          // Ajustar se houver campo de imagem diferente
        },
      });

      return referencias;
    } catch (error) {
      console.error('[MediaDeleteService] Erro ao verificar referências:', error);
      return referencias;
    }
  }

  /**
   * Deletar mídia se não estiver sendo utilizada
   */
  static async deleteSeguro(
    imagemId: string,
    usuarioId: string,
    ip?: string,
    userAgent?: string
  ): Promise<MediaDeleteResult> {
    try {
      // 1. Obter informações da mídia
      const imagem = await prisma.mediaImagem.findUnique({
        where: { id: imagemId },
      });

      if (!imagem) {
        return {
          success: false,
          deleted: false,
          error: 'Mídia não encontrada',
        };
      }

      // 2. Verificar referências
      const referencias = await this.verificarReferencias(imagemId);

      if (referencias.length > 0) {
        // Registrar tentativa de exclusão com referências
        await auditLog({
          usuario_id: usuarioId,
          acao: 'CMS_MIDIA_DELETE_BLOQUEADA',
          tabela_afetada: 'MediaImagem',
          id_recurso: imagemId,
          ip_address: ip,
          user_agent: userAgent,
          valores_antes: {
            arquivo: imagem.nome_arquivo,
            referencias: referencias.length,
          },
        });

        return {
          success: false,
          deleted: false,
          references: referencias,
          error: `Arquivo ainda está sendo utilizado em ${referencias.length} lugar(es)`,
        };
      }

      // 3. Deletar do storage
      try {
        await HostingerUploadService.deletarArquivo(imagem.caminho_relativo);
      } catch (storageError) {
        console.error(
          '[MediaDeleteService] Erro ao deletar do storage:',
          storageError
        );
        // Continuar mesmo se falhar no storage
      }

      // 4. Deletar do banco
      await prisma.mediaImagem.delete({
        where: { id: imagemId },
      });

      // 5. Registrar auditoria
      await auditLog({
        usuario_id: usuarioId,
        acao: 'CMS_MIDIA_DELETED',
        tabela_afetada: 'MediaImagem',
        id_recurso: imagemId,
        ip_address: ip,
        user_agent: userAgent,
        valores_antes: {
          arquivo: imagem.nome_arquivo,
          tamanho: imagem.tamanho_bytes,
          url: imagem.url_publica,
        },
      });

      return {
        success: true,
        deleted: true,
      };
    } catch (error) {
      console.error('[MediaDeleteService] Erro ao deletar mídia:', error);
      return {
        success: false,
        deleted: false,
        error: 'Erro ao deletar mídia',
      };
    }
  }

  /**
   * Deletar em batch (apenas para admin)
   */
  static async deleteBatch(
    imagemIds: string[],
    usuarioId: string,
    ip?: string,
    userAgent?: string
  ): Promise<{
    deleted: number;
    failed: number;
    errors: Array<{ id: string; error: string }>;
  }> {
    const resultado = {
      deleted: 0,
      failed: 0,
      errors: [] as Array<{ id: string; error: string }>,
    };

    for (const id of imagemIds) {
      const result = await this.deleteSeguro(id, usuarioId, ip, userAgent);

      if (result.deleted) {
        resultado.deleted++;
      } else {
        resultado.failed++;
        resultado.errors.push({
          id,
          error: result.error || 'Erro desconhecido',
        });
      }
    }

    return resultado;
  }
}
