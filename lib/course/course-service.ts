// Course Management Service

import { prisma } from '@/lib/db';
import { CreateCursoDTO, UpdateCursoDTO } from './types';
import { auditLog } from '@/lib/audit-logger';

export class CourseService {
  /**
   * Criar novo curso
   */
  static async criar(dados: CreateCursoDTO, usuarioId: string, ip?: string, userAgent?: string) {
    try {
      const { instrutor_id, ...cursoData } = dados as any;
      const curso = await prisma.curso.create({
        data: cursoData,
      });

      // Auditoria
      await auditLog({
        usuario_id: usuarioId,
        acao: 'CURSO_CRIAR',
        tabela_afetada: 'Curso',
        id_recurso: curso.id,
        valores_depois: dados,
        ip_address: ip,
        user_agent: userAgent,
      });

      return { success: true, data: curso };
    } catch (error) {
      console.error('[CourseService] Erro ao criar curso:', error);
      throw error;
    }
  }

  /**
   * Obter curso por ID
   */
  static async obter(cursoId: string) {
    try {
      const curso = await prisma.curso.findUnique({
        where: { id: cursoId },
        include: {
          modulos: {
            orderBy: { ordem: 'asc' },
            include: {
              aulas: {
                orderBy: { ordem: 'asc' },
              },
            },
          },
          _count: {
            select: {
              usuario_cursos: true,
              modulos: true,
            },
          },
        },
      });

      return { success: true, data: curso };
    } catch (error) {
      console.error('[CourseService] Erro ao obter curso:', error);
      return { success: false, error: 'Curso não encontrado' };
    }
  }

  /**
   * Listar cursos
   */
  static async listar(filtros?: {
    categoria?: string;
    nivel?: string;
    skip?: number;
    take?: number;
  }) {
    try {
      const cursos = await prisma.curso.findMany({
        where: {
          ...(filtros?.categoria && { categoria: filtros.categoria as any }),
          ...(filtros?.nivel && { nivel: filtros.nivel as any }),
        },
        include: {
          _count: {
            select: { usuario_cursos: true, modulos: true },
          },
        },
        orderBy: { criado_em: 'desc' },
        skip: filtros?.skip || 0,
        take: filtros?.take || 10,
      });

      return { success: true, data: cursos };
    } catch (error) {
      console.error('[CourseService] Erro ao listar cursos:', error);
      return { success: false, error: 'Erro ao listar' };
    }
  }

  /**
   * Atualizar curso
   */
  static async atualizar(
    cursoId: string,
    dados: UpdateCursoDTO,
    usuarioId: string,
    ip?: string,
    userAgent?: string
  ) {
    try {
      const anterior = await prisma.curso.findUnique({ where: { id: cursoId } });

      if (!anterior) {
        return { success: false, error: 'Curso não encontrado' };
      }

      // Remover campos que não devem ser atualizados
      const { instrutor_id, ...cursoData } = dados as any;

      const curso = await prisma.curso.update({
        where: { id: cursoId },
        data: cursoData,
      });

      // Auditoria
      await auditLog({
        usuario_id: usuarioId,
        acao: 'CURSO_ATUALIZAR',
        tabela_afetada: 'Curso',
        id_recurso: curso.id,
        valores_antes: anterior,
        valores_depois: cursoData,
        ip_address: ip,
        user_agent: userAgent,
      });

      return { success: true, data: curso };
    } catch (error) {
      console.error('[CourseService] Erro ao atualizar:', error);
      throw error;
    }
  }

  /**
   * Deletar curso
   */
  static async deletar(cursoId: string, usuarioId: string, ip?: string, userAgent?: string) {
    try {
      const curso = await prisma.curso.findUnique({ where: { id: cursoId } });

      if (!curso) {
        return { success: false, error: 'Curso não encontrado' };
      }

      // Soft delete - apenas marca como não publicado
      const deleted = await prisma.curso.update({
        where: { id: cursoId },
        data: { publicado: false },
      });

      // Auditoria
      await auditLog({
        usuario_id: usuarioId,
        acao: 'CURSO_DELETAR',
        tabela_afetada: 'Curso',
        id_recurso: cursoId,
        valores_antes: curso,
        ip_address: ip,
        user_agent: userAgent,
      });

      return { success: true, data: deleted };
    } catch (error) {
      console.error('[CourseService] Erro ao deletar:', error);
      throw error;
    }
  }

}
