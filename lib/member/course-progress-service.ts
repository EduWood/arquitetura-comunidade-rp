// Serviço de Progresso do Aluno em Cursos
// Gerencia início, conclusão, e rastreamento de progresso

import { prisma } from '@/lib/db';
import { auditLog } from '@/lib/audit-logger';

export class CourseProgressService {
  /**
   * Iniciar um curso (primeira aula)
   */
  static async startCourse(
    userId: string,
    courseId: string,
    ip?: string,
    userAgent?: string
  ) {
    try {
      const cursoProg = await prisma.usuarioCurso.findFirst({
        where: { usuario_id: userId, curso_id: courseId },
      });

      if (!cursoProg) {
        return { success: false, error: 'Usuário não tem acesso ao curso' };
      }

      // Atualizar status para EM_PROGRESSO
      const atualizado = await prisma.usuarioCurso.update({
        where: { id: cursoProg.id },
        data: {
          atualizado_em: new Date(),
        },
      });

      // Auditoria
      await auditLog({
        usuario_id: userId,
        acao: 'COURSE_START',
        tabela_afetada: 'UsuarioCurso',
        id_recurso: atualizado.id,
        ip_address: ip,
        user_agent: userAgent,
      });

      return { success: true, data: atualizado };
    } catch (error) {
      console.error('[CourseProgressService] Erro ao iniciar:', error);
      throw error;
    }
  }

  /**
   * Marcar aula como concluída
   */
  static async markLessonComplete(
    userId: string,
    lessonId: string,
    ip?: string,
    userAgent?: string
  ) {
    try {
      const aula = await prisma.aula.findUnique({
        where: { id: lessonId },
        include: { modulo: { select: { curso_id: true } } },
      });

      if (!aula) {
        return { success: false, error: 'Aula não encontrada' };
      }

      // Criar ou atualizar progresso da aula
      let progresso = await prisma.usuarioAula.findFirst({
        where: { usuario_id: userId, aula_id: lessonId },
      });

      if (progresso) {
        progresso = await prisma.usuarioAula.update({
          where: { id: progresso.id },
          data: {
            atualizado_em: new Date(),
          },
        });
      } else {
        progresso = await prisma.usuarioAula.create({
          data: {
            usuario_id: userId,
            aula_id: lessonId,
            tempo_asistido: 0,
            criado_em: new Date(),
            atualizado_em: new Date(),
          },
        });
      }

      // Atualizar progresso do curso
      await this.recalculateCourseProgress(userId, aula.modulo.curso_id);

      // Auditoria
      await auditLog({
        usuario_id: userId,
        acao: 'LESSON_COMPLETE',
        tabela_afetada: 'UsuarioAula',
        id_recurso: progresso.id,
        ip_address: ip,
        user_agent: userAgent,
      });

      return { success: true, data: progresso };
    } catch (error) {
      console.error('[CourseProgressService] Erro ao marcar completo:', error);
      throw error;
    }
  }

  /**
   * Desmarcar aula como concluída
   */
  static async unmarkLessonComplete(
    userId: string,
    lessonId: string,
    ip?: string,
    userAgent?: string
  ) {
    try {
      const aula = await prisma.aula.findUnique({
        where: { id: lessonId },
        include: { modulo: { select: { curso_id: true } } },
      });

      if (!aula) {
        return { success: false, error: 'Aula não encontrada' };
      }

      const progresso = await prisma.usuarioAula.findFirst({
        where: { usuario_id: userId, aula_id: lessonId },
      });

      if (!progresso) {
        return { success: true, message: 'Não tinha marcada como concluída' };
      }

      // Atualizar para EM_PROGRESSO
      const atualizado = await prisma.usuarioAula.update({
        where: { id: progresso.id },
        data: {
          atualizado_em: new Date(),
        },
      });

      // Recalcular progresso do curso
      await this.recalculateCourseProgress(userId, aula.modulo.curso_id);

      // Auditoria
      await auditLog({
        usuario_id: userId,
        acao: 'LESSON_UNCOMPLETE',
        tabela_afetada: 'UsuarioAula',
        id_recurso: atualizado.id,
        ip_address: ip,
        user_agent: userAgent,
      });

      return { success: true, data: atualizado };
    } catch (error) {
      console.error('[CourseProgressService] Erro ao desmarcar:', error);
      throw error;
    }
  }

  /**
   * Recalcular progresso do curso baseado nas aulas
   */
  private static async recalculateCourseProgress(userId: string, courseId: string) {
    try {
      // Total de aulas no curso
      const totalAulas = await prisma.aula.count({
        where: { modulo: { curso_id: courseId } },
      });

      if (totalAulas === 0) return;

      // Aulas concluídas pelo usuário
      const aulasCompletas = await prisma.usuarioAula.count({
        where: {
          usuario_id: userId,
          aula: { modulo: { curso_id: courseId } },
        },
      });

      const percentual = Math.round((aulasCompletas / totalAulas) * 100);
      const status = aulasCompletas === totalAulas ? 'CONCLUIDO' : 'EM_PROGRESSO';

      // Atualizar progresso do curso
      await prisma.usuarioCurso.updateMany({
        where: { usuario_id: userId, curso_id: courseId },
        data: {
          atualizado_em: new Date(),
        },
      });
    } catch (error) {
      console.error('[CourseProgressService] Erro ao recalcular:', error);
    }
  }

  /**
   * Obter progresso do usuário em um curso
   */
  static async getCourseProgress(userId: string, courseId: string) {
    try {
      const progresso = await prisma.usuarioCurso.findFirst({
        where: { usuario_id: userId, curso_id: courseId },
        include: {
          curso: {
            select: {
              titulo: true,
              modulos: {
                include: {
                  aulas: {
                    include: {
                      usuario_aulas: {
                        where: { usuario_id: userId },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!progresso) {
        return {
          success: true,
          data: {
            aulas_completas: 0,
            total_aulas: 0,
          },
        };
      }

      // Contar aulas completas
      let aulasCompletas = 0;
      let totalAulas = 0;

      progresso.curso.modulos.forEach((mod) => {
        mod.aulas.forEach((aula) => {
          totalAulas++;
          // Verificar se aula foi assistida pelo usuário
          const aulaUsuario = aula.usuario_aulas?.find(
            (ua) => ua.usuario_id === userId && ua.assistida
          );
          if (aulaUsuario) {
            aulasCompletas++;
          }
        });
      });

      return {
        success: true,
        data: {
          ...progresso,
          aulas_completas: aulasCompletas,
          total_aulas: totalAulas,
        },
      };
    } catch (error) {
      console.error('[CourseProgressService] Erro ao obter progresso:', error);
      return { success: false, error: 'Erro ao obter progresso' };
    }
  }

  /**
   * Obter progresso geral do usuário (todos os cursos)
   */
  static async getUserProgress(userId: string) {
    try {
      const cursos = await prisma.usuarioCurso.findMany({
        where: { usuario_id: userId },
        include: {
          curso: { select: { titulo: true } },
        },
        orderBy: { atualizado_em: 'desc' },
      });

      // Contar cursos concluídos e em progresso
      const concluidos = cursos.filter((c) => c.concluido).length;
      const emProgresso = cursos.filter((c) => !c.concluido).length;

      return {
        success: true,
        data: {
          total_cursos: cursos.length,
          cursos_concluidos: concluidos,
          cursos_em_progresso: emProgresso,
          media_progresso:
            cursos.length > 0
              ? Math.round(
                  cursos.reduce((sum, c) => sum + c.progresso_pct, 0) /
                    cursos.length
                )
              : 0,
          cursos,
        },
      };
    } catch (error) {
      console.error('[CourseProgressService] Erro ao obter:', error);
      return { success: false, error: 'Erro ao obter progresso' };
    }
  }

  /**
   */
  static async getLastLesson(userId: string, courseId: string) {
    try {
      const ultimaAula = await prisma.usuarioAula.findFirst({
        where: {
          usuario_id: userId,
          aula: { modulo: { curso_id: courseId } },
        },
        include: { aula: true },
        orderBy: { atualizado_em: 'desc' },
      });

      return { success: true, data: ultimaAula };
    } catch (error) {
      console.error('[CourseProgressService] Erro ao obter última:', error);
      return { success: false, error: 'Erro ao obter' };
    }
  }
}
