// Module Management Service

import { prisma } from '@/lib/db';
import { CreateModuloDTO, UpdateModuloDTO } from './types';
import { auditLog } from '@/lib/audit-logger';

export class ModuleService {
  /**
   * Criar módulo
   */
  static async criar(dados: CreateModuloDTO, usuarioId: string, ip?: string, userAgent?: string) {
    try {
      const modulo = await prisma.modulo.create({
        data: {
          ...dados,
          criado_em: new Date(),
          atualizado_em: new Date(),
        },
        include: {
          aulas: { orderBy: { ordem: 'asc' } },
        },
      });

      // Auditoria
      await auditLog({
        usuario_id: usuarioId,
        acao: 'MODULO_CRIAR',
        tabela_afetada: 'Modulo',
        id_recurso: modulo.id,
        valores_depois: dados,
        ip_address: ip,
        user_agent: userAgent,
      });

      return { success: true, data: modulo };
    } catch (error) {
      console.error('[ModuleService] Erro ao criar:', error);
      throw error;
    }
  }

  /**
   * Obter módulo
   */
  static async obter(moduloId: string) {
    try {
      const modulo = await prisma.modulo.findUnique({
        where: { id: moduloId },
        include: {
          curso: { select: { id: true, titulo: true } },
          aulas: {
            orderBy: { ordem: 'asc' },
            include: {
              _count: {
                select: { usuario_aulas: true },
              },
            },
          },
          _count: {
            select: { aulas: true },
          },
        },
      });

      return { success: true, data: modulo };
    } catch (error) {
      console.error('[ModuleService] Erro ao obter:', error);
      return { success: false, error: 'Módulo não encontrado' };
    }
  }

  /**
   * Listar módulos do curso
   */
  static async listarPorCurso(cursoId: string) {
    try {
      const modulos = await prisma.modulo.findMany({
        where: { curso_id: cursoId },
        include: {
          aulas: {
            select: { id: true, titulo: true, ordem: true },
            orderBy: { ordem: 'asc' },
          },
          _count: {
            select: { aulas: true },
          },
        },
        orderBy: { ordem: 'asc' },
      });

      return { success: true, data: modulos };
    } catch (error) {
      console.error('[ModuleService] Erro ao listar:', error);
      return { success: false, error: 'Erro ao listar' };
    }
  }

  /**
   * Atualizar módulo
   */
  static async atualizar(
    moduloId: string,
    dados: UpdateModuloDTO,
    usuarioId: string,
    ip?: string,
    userAgent?: string
  ) {
    try {
      const anterior = await prisma.modulo.findUnique({ where: { id: moduloId } });

      if (!anterior) {
        return { success: false, error: 'Módulo não encontrado' };
      }

      const modulo = await prisma.modulo.update({
        where: { id: moduloId },
        data: {
          ...dados,
          atualizado_em: new Date(),
        },
      });

      // Auditoria
      await auditLog({
        usuario_id: usuarioId,
        acao: 'MODULO_ATUALIZAR',
        tabela_afetada: 'Modulo',
        id_recurso: moduloId,
        valores_antes: anterior,
        valores_depois: dados,
        ip_address: ip,
        user_agent: userAgent,
      });

      return { success: true, data: modulo };
    } catch (error) {
      console.error('[ModuleService] Erro ao atualizar:', error);
      throw error;
    }
  }

  /**
   * Reordenar módulos
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
          prisma.modulo.update({
            where: { id: item.id },
            data: { ordem: item.ordem },
          })
        )
      );

      // Auditoria
      await auditLog({
        usuario_id: usuarioId,
        acao: 'MODULO_REORDENAR',
        tabela_afetada: 'Modulo',
        valores_depois: reordenacao,
        ip_address: ip,
        user_agent: userAgent,
      });

      return { success: true };
    } catch (error) {
      console.error('[ModuleService] Erro ao reordenar:', error);
      throw error;
    }
  }

  /**
   * Deletar módulo
   */
  static async deletar(moduloId: string, usuarioId: string, ip?: string, userAgent?: string) {
    try {
      const modulo = await prisma.modulo.findUnique({ where: { id: moduloId } });

      if (!modulo) {
        return { success: false, error: 'Módulo não encontrado' };
      }

      // Para deletar, remover todas as aulas e depois o módulo
      await prisma.aula.deleteMany({ where: { modulo_id: moduloId } });
      const deleted = await prisma.modulo.delete({ where: { id: moduloId } });

      // Auditoria
      await auditLog({
        usuario_id: usuarioId,
        acao: 'MODULO_DELETAR',
        tabela_afetada: 'Modulo',
        id_recurso: moduloId,
        valores_antes: modulo,
        ip_address: ip,
        user_agent: userAgent,
      });

      return { success: true, data: deleted };
    } catch (error) {
      console.error('[ModuleService] Erro ao deletar:', error);
      throw error;
    }
  }
}
