// CMS Image Management Service

import { prisma } from '@/lib/db';
import { auditLog } from '@/lib/audit-logger';

export class CMSImageService {
  /**
   * Registrar imagem no CMS
   */
  static async registrarImagem(
    nomeOriginal: string,
    caminhoRelativo: string,
    urlPublica: string,
    nomeArquivo: string,
    tipoMime: string,
    tamanho: number,
    usuarioId: string,
    largura?: number,
    altura?: number
  ) {
    try {
      const imagem = await prisma.mediaImagem.create({
        data: {
          nome_original: nomeOriginal,
          nome_arquivo: nomeArquivo,
          caminho_relativo: caminhoRelativo,
          url_publica: urlPublica,
          tipo_mime: tipoMime,
          tamanho_bytes: tamanho,
          largura,
          altura,
        },
      });

      // Auditoria
      await auditLog({
        usuario_id: usuarioId,
        acao: 'CMS_IMAGEM_UPLOAD',
        tabela_afetada: 'MediaImagem',
        id_recurso: imagem.id,
        valores_depois: {
          arquivo: nomeArquivo,
          tamanho: tamanho,
          url: urlPublica,
        },
      });

      return {
        success: true,
        data: imagem,
      };
    } catch (error) {
      console.error('[CMSImageService] Erro ao registrar imagem:', error);
      throw error;
    }
  }

  /**
   * Listar todas as imagens
   */
  static async listarImagens() {
    try {
      const imagens = await prisma.mediaImagem.findMany({
        orderBy: { criado_em: 'desc' },
      });

      return {
        success: true,
        data: imagens,
      };
    } catch (error) {
      console.error('[CMSImageService] Erro ao listar imagens:', error);
      throw error;
    }
  }

  /**
   * Deletar imagem
   */
  static async deletarImagem(imagemId: string, usuarioId: string) {
    try {
      const imagem = await prisma.mediaImagem.findUnique({
        where: { id: imagemId },
      });

      if (!imagem) {
        return {
          success: false,
          error: 'Imagem não encontrada',
        };
      }

      await prisma.mediaImagem.delete({
        where: { id: imagemId },
      });

      // Auditoria
      await auditLog({
        usuario_id: usuarioId,
        acao: 'CMS_IMAGEM_DELETE',
        tabela_afetada: 'MediaImagem',
        id_recurso: imagemId,
        valores_antes: {
          arquivo: imagem.nome_arquivo,
          url: imagem.url_publica,
        },
      });

      return {
        success: true,
      };
    } catch (error) {
      console.error('[CMSImageService] Erro ao deletar imagem:', error);
      throw error;
    }
  }
}

