// Serviço de Continuar Assistindo
// Salva posição do vídeo para retomar depois

import { prisma } from '@/lib/db';

interface ContinueWatchingData {
  aula_id: string;
  timestamp_segundos: number;
  progresso_pct: number;
}

export class ContinueWatchingService {
  /**
   * Salvar posição atual do vídeo
   */
  static async savePosition(
    userId: string,
    aulaId: string,
    timestampSegundos: number,
    progressoPercentual: number
  ) {
    try {
      // Atualizar progresso da aula (nota: schema usa tempo_asistido com typo)
      const progresso = await prisma.usuarioAula.findFirst({
        where: { usuario_id: userId, aula_id: aulaId },
      });

      if (progresso) {
        const atualizado = await prisma.usuarioAula.update({
          where: { id: progresso.id },
          data: {
            tempo_asistido: timestampSegundos, // Schema field name (com typo)
            atualizado_em: new Date(),
          },
        });
        return { success: true, data: atualizado };
      } else {
        // Criar novo registro
        const novo = await prisma.usuarioAula.create({
          data: {
            usuario_id: userId,
            aula_id: aulaId,
            tempo_asistido: timestampSegundos,
            assistida: false,
            criado_em: new Date(),
            atualizado_em: new Date(),
          },
        });
        return { success: true, data: novo };
      }
    } catch (error) {
      console.error('[ContinueWatchingService] Erro ao salvar:', error);
      throw error;
    }
  }

  /**
   * Atualizar posição (alternativa para savePosition)
   */
  static async updatePosition(
    userId: string,
    aulaId: string,
    timestampSegundos: number,
    progressoPercentual: number
  ) {
    return this.savePosition(userId, aulaId, timestampSegundos, progressoPercentual);
  }

  /**
   * Obter continuar assistindo (últimos vídeos em progresso)
   */
  static async getContinueWatching(userId: string, limit = 5) {
    try {
      const emProgresso = await prisma.usuarioAula.findMany({
        where: {
          usuario_id: userId,
          assistida: false,
          tempo_asistido: { gt: 0 }, // Apenas que iniciou
        },
        orderBy: { atualizado_em: 'desc' },
        take: limit,
      });

      return {
        success: true,
        data: emProgresso.map((ua) => ({
          aula_id: ua.aula_id,
          timestamp_segundos: ua.tempo_asistido || 0,
          progresso_pct: 0, // Calculado separadamente via UsuarioCurso
          atualizado_em: ua.atualizado_em,
        })),
      };
    } catch (error) {
      console.error('[ContinueWatchingService] Erro ao obter:', error);
      return { success: false, error: 'Erro ao obter' };
    }
  }

  /**
   * Obter posição específica de uma aula
   */
  static async getPosition(userId: string, lessonId: string) {
    try {
      const progresso = await prisma.usuarioAula.findFirst({
        where: { usuario_id: userId, aula_id: lessonId },
      });

      if (!progresso) {
        return {
          success: true,
          data: {
            timestamp_segundos: 0,
            progresso_pct: 0,
          },
        };
      }

      return {
        success: true,
        data: {
          timestamp_segundos: progresso.tempo_asistido || 0,
          progresso_pct: 0, // Calculado via UsuarioCurso
        },
      };
    } catch (error) {
      console.error('[ContinueWatchingService] Erro ao obter posição:', error);
      return { success: false, error: 'Erro ao obter posição' };
    }
  }

  /**
   * Limpar posição (quando aula é concluída)
   */
  static async clearPosition(userId: string, lessonId: string) {
    try {
      await prisma.usuarioAula.updateMany({
        where: { usuario_id: userId, aula_id: lessonId },
        data: { tempo_asistido: 0 },
      });

      return { success: true };
    } catch (error) {
      console.error('[ContinueWatchingService] Erro ao limpar:', error);
      throw error;
    }
  }
}
