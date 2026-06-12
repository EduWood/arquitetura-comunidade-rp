// CMS Content Service - Gerencia todos os conteúdos do CMS

import { prisma } from '@/lib/db';
import { CMSValidator } from './validators';
import { auditLog } from '@/lib/audit-logger';
import { TipoSecao } from '@prisma/client';

export class CMSService {
  /**
   * Obter seção do CMS
   */
  static async getSecao(paginaId: string, tipo: TipoSecao) {
    try {
      const secao = await prisma.cMSSecao.findFirst({
        where: {
          pagina_id: paginaId,
          tipo_secao: tipo,
        },
        include: { blocos: true },
      });

      return {
        success: true,
        data: secao,
      };
    } catch (error) {
      console.error('[CMSService] Erro ao obter seção:', error);
      throw error;
    }
  }

  /**
   * Listar todas as seções de uma página
   */
  static async listarSecoes(paginaId: string) {
    try {
      const secoes = await prisma.cMSSecao.findMany({
        where: { pagina_id: paginaId },
        include: { blocos: true },
        orderBy: { ordem: 'asc' },
      });

      return {
        success: true,
        data: secoes,
      };
    } catch (error) {
      console.error('[CMSService] Erro ao listar seções:', error);
      throw error;
    }
  }

  /**
   * Atualizar seção do CMS
   */
  static async atualizarSecao(
    secaoId: string,
    dados: Record<string, any>,
    usuarioId: string
  ) {
    try {
      // Obter seção anterior para auditoria
      const anterior = await prisma.cMSSecao.findUnique({
        where: { id: secaoId },
      });

      if (!anterior) {
        return {
          success: false,
          error: 'Seção não encontrada',
        };
      }

      // Validar conteúdo
      const validacao = this.validarDados(anterior.tipo_secao, dados);
      if (!validacao.valid) {
        return {
          success: false,
          error: validacao.errors.join(', '),
        };
      }

      // Atualizar seção
      const secao = await prisma.cMSSecao.update({
        where: { id: secaoId },
        data: {
          dados_json: JSON.stringify(dados),
          atualizado_em: new Date(),
        },
      });

      // Registrar auditoria
      await auditLog({
        usuario_id: usuarioId,
        acao: 'CMS_SECAO_UPDATE',
        tabela_afetada: 'CMSSecao',
        id_recurso: secao.id,
        valores_antes: JSON.parse(anterior.dados_json),
        valores_depois: dados,
      });

      return {
        success: true,
        data: secao,
      };
    } catch (error) {
      console.error('[CMSService] Erro ao atualizar seção:', error);
      throw error;
    }
  }

  /**
   * Reordenar seções
   */
  static async reordenarSecoes(
    reordenacao: Array<{ id: string; ordem: number }>,
    usuarioId: string
  ) {
    try {
      await Promise.all(
        reordenacao.map((item) =>
          prisma.cMSSecao.update({
            where: { id: item.id },
            data: { ordem: item.ordem },
          })
        )
      );

      // Auditoria
      await auditLog({
        usuario_id: usuarioId,
        acao: 'CMS_SECOES_REORDENAR',
        tabela_afetada: 'CMSSecao',
        valores_depois: reordenacao,
      });

      return {
        success: true,
      };
    } catch (error) {
      console.error('[CMSService] Erro ao reordenar:', error);
      throw error;
    }
  }

  /**
   * Validar dados baseado no tipo de seção
   */
  private static validarDados(tipo: TipoSecao, dados: Record<string, any>) {
    // Implementar validações específicas por tipo de seção
    const errors: string[] = [];

    if (!dados || typeof dados !== 'object') {
      errors.push('Dados devem ser um objeto');
    }

    return { valid: errors.length === 0, errors };
  }
}


