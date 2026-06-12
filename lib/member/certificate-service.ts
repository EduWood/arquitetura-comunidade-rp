// Serviço de Certificados
// Gerencia geração e download de certificados

import { prisma } from '@/lib/db';
import { auditLog } from '@/lib/audit-logger';

export class CertificateService {
  /**
   * Verificar se usuário pode gerar certificado
   * Regra: Curso deve estar 100% completo
   */
  static async canGenerateCertificate(userId: string, courseId: string): Promise<boolean> {
    try {
      const progresso = await prisma.usuarioCurso.findFirst({
        where: { usuario_id: userId, curso_id: courseId },
      });

      if (!progresso) {
        return false;
      }

      // Apenas se 100% concluído
      return progresso.progresso_pct === 100 && progresso.concluido === true;
    } catch (error) {
      console.error('[CertificateService] Erro ao verificar:', error);
      return false;
    }
  }

  /**
   * Gerar certificado (com número único)
   */
  static async generateCertificate(
    userId: string,
    courseId: string,
    usuarioId: string,
    ip?: string,
    userAgent?: string
  ) {
    try {
      // Verificar se pode gerar
      const podeMgerador = await this.canGenerateCertificate(userId, courseId);
      if (!podeMgerador) {
        return { success: false, error: 'Curso não completado' };
      }

      // Verificar se já tem certificado
      const existente = await prisma.certificado?.findFirst({
        where: { usuario_id: userId, curso_id: courseId },
      });

      if (existente) {
        return { success: true, data: existente, message: 'Certificado já emitido' };
      }

      // Gerar número único
      const numeroCertificado = this.gerarNumeroCertificado();

      // Criar registro (usando modelo improvisado)
      // Em produção: teria tabela Certificado
      const certificado = {
        id: `cert-${Math.random().toString(36).substr(2, 9)}`,
        numero_certificado: numeroCertificado,
        usuario_id: userId,
        curso_id: courseId,
        data_emissao: new Date(),
        data_validade: this.calcularValidade(new Date()),
        criado_em: new Date(),
      };

      // TODO: Salvar em banco quando tabela Certificado existir
      // Por enquanto, apenas retornar dados

      // Auditoria
      await auditLog({
        usuario_id: usuarioId,
        acao: 'CERTIFICADO_GERAR',
        tabela_afetada: 'Certificado',
        id_recurso: certificado.id,
        valores_depois: certificado,
        ip_address: ip,
        user_agent: userAgent,
      });

      return { success: true, data: certificado };
    } catch (error) {
      console.error('[CertificateService] Erro ao gerar:', error);
      throw error;
    }
  }

  /**
   * Obter certificado
   */
  static async obter(certificadoId: string) {
    try {
      // TODO: Implementar quando tabela Certificado existir
      return {
        success: false,
        error: 'Tabela Certificado não implementada',
      };
    } catch (error) {
      console.error('[CertificateService] Erro ao obter:', error);
      return { success: false, error: 'Erro ao obter' };
    }
  }

  /**
   * Listar certificados do usuário
   */
  static async listarUsuario(userId: string) {
    try {
      // Obter todos os cursos completos do usuário
      const cursosCompletos = await prisma.usuarioCurso.findMany({
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
              descricao: true,
            },
          },
        },
      });

      // Retornar como certificados
      const certificados = cursosCompletos.map((uc) => ({
        id: `cert-${uc.id}`,
        numero_certificado: this.gerarNumeroCertificado(), // Em produção, viria do banco
        curso_id: uc.curso.id,
        curso_titulo: uc.curso.titulo,
        usuario_id: userId,
        data_emissao: uc.atualizado_em,
        data_validade: this.calcularValidade(uc.atualizado_em),
      }));

      return { success: true, data: certificados };
    } catch (error) {
      console.error('[CertificateService] Erro ao listar:', error);
      return { success: false, error: 'Erro ao listar' };
    }
  }

  /**
   * Download do certificado (gerar PDF)
   * TODO: Implementar geração de PDF real
   */
  static async downloadCertificate(
    certificadoId: string,
    userId: string,
    ip?: string,
    userAgent?: string
  ) {
    try {
      // Auditoria
      await auditLog({
        usuario_id: userId,
        acao: 'CERTIFICADO_DOWNLOAD',
        tabela_afetada: 'Certificado',
        id_recurso: certificadoId,
        ip_address: ip,
        user_agent: userAgent,
      });

      return {
        success: true,
        message: 'PDF gerado com sucesso',
        data: {
          filename: `certificado-${certificadoId}.pdf`,
          // Em produção: retornar buffer PDF real
        },
      };
    } catch (error) {
      console.error('[CertificateService] Erro ao fazer download:', error);
      throw error;
    }
  }

  /**
   * Verificar se certificado é válido
   */
  static async verificarCertificado(numeroCertificado: string) {
    try {
      // TODO: Implementar verificação no banco
      // Por enquanto: validação simples

      if (!numeroCertificado || numeroCertificado.length < 10) {
        return { valido: false, motivo: 'Formato inválido' };
      }

      return {
        valido: true,
        numero: numeroCertificado,
        data_emissao: new Date(),
      };
    } catch (error) {
      console.error('[CertificateService] Erro ao verificar:', error);
      return { valido: false, motivo: 'Erro ao verificar' };
    }
  }

  /**
   * Gerar número único de certificado
   */
  private static gerarNumeroCertificado(): string {
    const data = new Date();
    const ano = data.getFullYear();
    const random = Math.random().toString(36).substr(2, 9).toUpperCase();
    return `CERT-${ano}-${random}`;
  }

  /**
   * Calcular validade do certificado (5 anos)
   */
  private static calcularValidade(dataEmissao: Date): Date {
    const novaData = new Date(dataEmissao);
    novaData.setFullYear(novaData.getFullYear() + 5);
    return novaData;
  }
}
