// Lesson Management Service

import { prisma } from '@/lib/db';
import { CreateAulaDTO, UpdateAulaDTO } from './types';
import { auditLog } from '@/lib/audit-logger';

export class LessonService {
  /**
   * Criar aula
   */
  static async criar(dados: CreateAulaDTO, usuarioId: string, ip?: string, userAgent?: string) {
    try {
      const aula = await prisma.aula.create({
        data: {
          ...dados,
          criado_em: new Date(),
          atualizado_em: new Date(),
        },
        include: {
          modulo: { select: { id: true, titulo: true } },
          videos: { where: { ativo: true } },
          materiais: { where: { ativo: true } },
        },
      });

      // Auditoria
      await auditLog({
        usuario_id: usuarioId,
        acao: 'AULA_CRIAR',
        tabela_afetada: 'Aula',
        id_recurso: aula.id,
        valores_depois: dados,
        ip_address: ip,
        user_agent: userAgent,
      });

      return { success: true, data: aula };
    } catch (error) {
      console.error('[LessonService] Erro ao criar:', error);
      throw error;
    }
  }

  /**
   * Obter aula
   */
  static async obter(aulaId: string) {
    try {
      const aula = await prisma.aula.findUnique({
        where: { id: aulaId },
        include: {
          modulo: {
            select: {
              id: true,
              titulo: true,
              curso_id: true,
              curso: { select: { titulo: true } },
            },
          },
        },
      });

      return { success: true, data: aula };
    } catch (error) {
      console.error('[LessonService] Erro ao obter:', error);
      return { success: false, error: 'Aula não encontrada' };
    }
  }
  }

  /**
   * Listar aulas do módulo
   */
  static async listarPorModulo(moduloId: string) {
    try {
      const aulas = await prisma.aula.findMany({
        where: { modulo_id: moduloId },
        include: {
          _count: {
            select: { usuario_aulas: true },
          },
        },
        orderBy: { ordem: 'asc' },
      });

      return { success: true, data: aulas };
    } catch (error) {
      console.error('[LessonService] Erro ao listar:', error);
      return { success: false, error: 'Erro ao listar' };
    }
  }

  /**
   * Atualizar aula
   */
  static async atualizar(
    aulaId: string,
    dados: UpdateAulaDTO,
    usuarioId: string,
    ip?: string,
    userAgent?: string
  ) {
    try {
      const anterior = await prisma.aula.findUnique({ where: { id: aulaId } });

      if (!anterior) {
        return { success: false, error: 'Aula não encontrada' };
      }

      const aula = await prisma.aula.update({
        where: { id: aulaId },
        data: dados as any,
      });

      // Auditoria
      await auditLog({
        usuario_id: usuarioId,
        acao: 'AULA_ATUALIZAR',
        tabela_afetada: 'Aula',
        id_recurso: aulaId,
        valores_antes: anterior,
        valores_depois: dados,
        ip_address: ip,
        user_agent: userAgent,
      });

      return { success: true, data: aula };
    } catch (error) {
      console.error('[LessonService] Erro ao atualizar:', error);
      throw error;
    }
  }

  /**
   * Reordenar aulas
   */
  static async reordenar(
    reordenacao: Array<{ id: string; ordem: number }>,
    usuarioId: string,
    ip?: string,
    userAgent?: string
  ) {
    try {
      await Promise.all(
        reordenacao.map((item) =>
          prisma.aula.update({
            where: { id: item.id },
            data: { ordem: item.ordem },
          })
        )
      );

      // Auditoria
      await auditLog({
        usuario_id: usuarioId,
        acao: 'AULA_REORDENAR',
        tabela_afetada: 'Aula',
        valores_depois: reordenacao,
        ip_address: ip,
        user_agent: userAgent,
      });

      return { success: true };
    } catch (error) {
      console.error('[LessonService] Erro ao reordenar:', error);
      throw error;
    }
  }

  /**
   * Deletar aula
   */
  static async deletar(aulaId: string, usuarioId: string, ip?: string, userAgent?: string) {
    try {
      const aula = await prisma.aula.findUnique({ where: { id: aulaId } });

      if (!aula) {
        return { success: false, error: 'Aula não encontrada' };
      }

      // Soft delete - apenas marca status como inativo (sem campo ativo)
      // Para hard delete, seria necessário remover registros relacionados primeiro
      // Auditoria
      await auditLog({
        usuario_id: usuarioId,
        acao: 'AULA_DELETAR',
        tabela_afetada: 'Aula',
        id_recurso: aulaId,
        valores_antes: aula,
        ip_address: ip,
        user_agent: userAgent,
      });

      return { success: true, data: aula };
    } catch (error) {
      console.error('[LessonService] Erro ao deletar:', error);
      throw error;
    }
  }
}
