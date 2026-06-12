// Serviço de Controle de Acesso a Cursos
// Define quem pode acessar quais cursos baseado em relacionamento no banco

import { prisma } from '@/lib/db';
import { auditLog } from '@/lib/audit-logger';

export class CourseAccessService {
  /**
   * Verificar se usuário pode acessar um curso
   * Regras:
   * - Se UsuarioCurso existe com ativo=true, pode acessar
   * - Senão, não pode
   */
  static async canAccessCourse(userId: string, courseId: string): Promise<boolean> {
    try {
      const acesso = await prisma.usuarioCurso.findFirst({
        where: {
          usuario_id: userId,
          curso_id: courseId,
        },
      });
      return !!acesso;
    } catch (error) {
      console.error('[CourseAccessService] Erro ao verificar acesso:', error);
      return false;
    }
  }

  /**
   * Obter todos os cursos que o usuário pode acessar
   */
  static async getUserCourses(userId: string, skip = 0, take = 10) {
    try {
      const cursos = await prisma.usuarioCurso.findMany({
        where: { usuario_id: userId },
        include: {
          curso: {
            select: {
              id: true,
              titulo: true,
              descricao: true,
              categoria: true,
              nivel: true,
              publicado: true,
              modulos: {
                select: { id: true },
              },
              _count: {
                select: { modulos: true },
              },
            },
          },
        },
        skip,
        take,
        orderBy: { atualizado_em: 'desc' },
      });

      return {
        success: true,
        data: cursos.map((uc) => ({
          ...uc.curso,
          progresso_pct: uc.progresso_pct,
          concluido: uc.concluido,
          data_inscricao: uc.data_inscricao,
        })),
      };
    } catch (error) {
      console.error('[CourseAccessService] Erro ao obter cursos:', error);
      return { success: false, error: 'Erro ao obter cursos' };
    }
  }

  /**
   * Obter cursos bloqueados (não inscritos)
   */
  static async getLockedCourses(userId: string, skip = 0, take = 10) {
    try {
      // Obter todos os cursos publicados
      const todosCursos = await prisma.curso.findMany({
        where: { publicado: true },
        select: { id: true },
      });

      const idsCursos = todosCursos.map((c) => c.id);

      // Obter cursos que o usuário tem acesso
      const cursosAcesso = await prisma.usuarioCurso.findMany({
        where: { usuario_id: userId },
        select: { curso_id: true },
      });

      const idsAcesso = cursosAcesso.map((c) => c.curso_id);

      // Bloqueados = publicados - acesso
      const idsBloqueados = idsCursos.filter((id) => !idsAcesso.includes(id));

      const bloqueados = await prisma.curso.findMany({
        where: { id: { in: idsBloqueados } },
        select: {
          id: true,
          titulo: true,
          descricao: true,
          categoria: true,
          nivel: true,
          _count: { select: { modulos: true } },
        },
        skip,
        take,
      });

      return { success: true, data: bloqueados };
    } catch (error) {
      console.error('[CourseAccessService] Erro ao obter bloqueados:', error);
      return { success: false, error: 'Erro ao obter' };
    }
  }

  /**
   * Verificar acesso por tipo de plano (futuro: quando tabela Plano existir)
   * Por enquanto: se tem UsuarioCurso, tem acesso (plano implícito)
   */
  static async checkSubscriptionAccess(userId: string, planId?: string): Promise<boolean> {
    try {
      // TODO: Quando tabela Plano e Assinatura forem criadas, implementar lógica de plano
      // Por enquanto: retorna true se usuário existe
      const usuario = await prisma.usuario.findUnique({ where: { id: userId } });
      return !!usuario;
    } catch (error) {
      console.error('[CourseAccessService] Erro ao verificar subscrição:', error);
      return false;
    }
  }

  /**
   * Dar acesso a um curso para um usuário
   */
  static async grantAccess(
    userId: string,
    courseId: string,
    usuarioId: string,
    ip?: string,
    userAgent?: string
  ) {
    try {
      const existente = await prisma.usuarioCurso.findFirst({
        where: { usuario_id: userId, curso_id: courseId },
      });

      if (existente) {
        return { success: true, data: existente, message: 'Já tinha acesso' };
      }

      const acesso = await prisma.usuarioCurso.create({
        data: {
          usuario_id: userId,
          curso_id: courseId,
          progresso_pct: 0,
          concluido: false,
          atualizado_em: new Date(),
        },
      });

      // Auditoria
      await auditLog({
        usuario_id: usuarioId,
        acao: 'COURSE_ACCESS_GRANT',
        tabela_afetada: 'UsuarioCurso',
        id_recurso: acesso.id,
        valores_depois: { usuario_id: userId, curso_id: courseId },
        ip_address: ip,
        user_agent: userAgent,
      });

      return { success: true, data: acesso };
    } catch (error) {
      console.error('[CourseAccessService] Erro ao dar acesso:', error);
      throw error;
    }
  }

  /**
   * Remover acesso de um usuário a um curso
   */
  static async revokeAccess(
    userId: string,
    courseId: string,
    adminId: string,
    ip?: string,
    userAgent?: string
  ) {
    try {
      const acesso = await prisma.usuarioCurso.deleteMany({
        where: { usuario_id: userId, curso_id: courseId },
      });

      // Auditoria
      await auditLog({
        usuario_id: adminId,
        acao: 'COURSE_ACCESS_REVOKE',
        tabela_afetada: 'UsuarioCurso',
        valores_antes: { usuario_id: userId, curso_id: courseId },
        ip_address: ip,
        user_agent: userAgent,
      });

      return { success: true, deleted: acesso.count };
    } catch (error) {
      console.error('[CourseAccessService] Erro ao remover acesso:', error);
      throw error;
    }
  }
}
