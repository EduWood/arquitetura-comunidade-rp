// Serviço de Dashboard do Aluno
// Agrupa dados para exibição na dashboard

import { prisma } from '@/lib/db';
import { CourseAccessService } from './course-access-service';
import { CourseProgressService } from './course-progress-service';
import { ContinueWatchingService } from './continue-watching-service';

export class DashboardService {
  /**
   * Obter dados completos do dashboard
   */
  static async getDashboardData(userId: string) {
    try {
      // Paralelize todas as queries
      const [
        cursosAtivos,
        cursosConcluidos,
        progressoGeral,
        continuarAssistindo,
        ultimaAtividade,
      ] = await Promise.all([
        this.getInProgressCourses(userId),
        this.getCompletedCourses(userId),
        this.getProgressSummary(userId),
        ContinueWatchingService.getContinueWatching(userId, 3),
        this.getLastActivity(userId),
      ]);

      return {
        success: true,
        data: {
          resumo: progressoGeral.success ? progressoGeral.data : null,
          cursos_em_progresso: cursosAtivos.success ? cursosAtivos.data : [],
          cursos_concluidos: cursosConcluidos.success ? cursosConcluidos.data : [],
          continuar_assistindo: continuarAssistindo.success
            ? continuarAssistindo.data
            : [],
          ultima_atividade: ultimaAtividade,
          data_acesso: new Date(),
        },
      };
    } catch (error) {
      console.error('[DashboardService] Erro ao obter dados:', error);
      return { success: false, error: 'Erro ao carregar dashboard' };
    }
  }

  /**
   * Obter cursos recentes (últimos acessados)
   */
  static async getRecentCourses(userId: string, limit = 5) {
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
            },
          },
        },
        orderBy: { atualizado_em: 'desc' },
        take: limit,
      });

      return {
        success: true,
        data: cursos.map((uc) => ({
          id: uc.curso.id,
          titulo: uc.curso.titulo,
          descricao: uc.curso.descricao,
          categoria: uc.curso.categoria,
          progresso: uc.progresso_pct,
          atualizado_em: uc.atualizado_em,
        })),
      };
    } catch (error) {
      console.error('[DashboardService] Erro ao obter recentes:', error);
      return { success: false, data: [] };
    }
  }

  /**
   * Obter cursos completos (certificáveis)
   */
  static async getCompletedCourses(userId: string, limit = 10) {
    try {
      const cursos = await prisma.usuarioCurso.findMany({
        where: {
          usuario_id: userId,
          concluido: true as any,
          progresso_pct: 100,
        },
        include: {
          curso: {
            select: {
              id: true,
              titulo: true,
              categoria: true,
            },
          },
        },
        orderBy: { atualizado_em: 'desc' },
        take: limit,
      });

      return {
        success: true,
        data: cursos.map((uc) => ({
          id: uc.curso.id,
          titulo: uc.curso.titulo,
          categoria: uc.curso.categoria,
          data_conclusao: uc.atualizado_em,
          pode_gerar_certificado: true,
        })),
      };
    } catch (error) {
      console.error('[DashboardService] Erro ao obter completos:', error);
      return { success: false, data: [] };
    }
  }

  /**
   * Obter cursos em progresso
   */
  static async getInProgressCourses(userId: string, limit = 10) {
    try {
      const cursos = await prisma.usuarioCurso.findMany({
        where: {
          usuario_id: userId,
        },
        include: {
          curso: {
            select: {
              id: true,
              titulo: true,
              descricao: true,
              categoria: true,
              _count: { select: { modulos: true } },
            },
          },
        },
        orderBy: { atualizado_em: 'desc' },
        take: limit,
      });

      return {
        success: true,
        data: cursos.map((uc) => ({
          id: uc.curso.id,
          titulo: uc.curso.titulo,
          descricao: uc.curso.descricao,
          categoria: uc.curso.categoria,
          progresso: uc.progresso_pct,
          modulos_total: uc.curso._count.modulos,
        })),
      };
    } catch (error) {
      console.error('[DashboardService] Erro ao obter em progresso:', error);
      return { success: false, data: [] };
    }
  }

  /**
   * Obter resumo de progresso geral
   */
  static async getProgressSummary(userId: string) {
    try {
      const todosCursos = await prisma.usuarioCurso.findMany({
        where: { usuario_id: userId },
      });

      const concluidos = todosCursos.filter((c) => c.concluido === true).length;
      const emProgresso = todosCursos.filter((c) => c.concluido === false).length;
      const naoIniciados = todosCursos.filter((c) => c.concluido === false).length;

      const mediaProgresso =
        todosCursos.length > 0
          ? Math.round(
              todosCursos.reduce((sum, c) => sum + c.progresso_pct, 0) /
                todosCursos.length
            )
          : 0;

      return {
        success: true,
        data: {
          total_cursos_inscritos: todosCursos.length,
          cursos_concluidos: concluidos,
          cursos_em_progresso: emProgresso,
          cursos_nao_iniciados: naoIniciados,
          progresso_medio: mediaProgresso,
          percentual_conclusao:
            todosCursos.length > 0
              ? Math.round((concluidos / todosCursos.length) * 100)
              : 0,
        },
      };
    } catch (error) {
      console.error('[DashboardService] Erro ao obter resumo:', error);
      return { success: false, data: null };
    }
  }

  /**
   * Obter última atividade do usuário
   */
  private static async getLastActivity(userId: string) {
    try {
      const ultimaAulaAula = await prisma.usuarioAula.findFirst({
        where: { usuario_id: userId },
        include: { aula: true },
        orderBy: { atualizado_em: 'desc' },
      });

      if (ultimaAulaAula) {
        return {
          tipo: 'aula',
          aula_titulo: ultimaAulaAula.aula.titulo,
          atualizado_em: ultimaAulaAula.atualizado_em,
        };
      }

      const ultimoCurso = await prisma.usuarioCurso.findFirst({
        where: { usuario_id: userId },
        include: { curso: true },
        orderBy: { atualizado_em: 'desc' },
      });

      if (ultimoCurso) {
        return {
          tipo: 'curso',
          curso_titulo: ultimoCurso.curso.titulo,
          atualizado_em: ultimoCurso.atualizado_em,
        };
      }

      return null;
    } catch (error) {
      console.error('[DashboardService] Erro ao obter atividade:', error);
      return null;
    }
  }

  /**
   * Obter informações do usuário para perfil
   */
  static async getUserProfile(userId: string) {
    try {
      const usuario = await prisma.usuario.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          nome: true,
        },
      });

      if (!usuario) {
        return { success: false, error: 'Usuário não encontrado' };
      }

      return { success: true, data: usuario };
    } catch (error) {
      console.error('[DashboardService] Erro ao obter perfil:', error);
      return { success: false, error: 'Erro ao obter perfil' };
    }
  }
}
