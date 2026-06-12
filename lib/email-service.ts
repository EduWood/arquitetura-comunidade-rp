import nodemailer from 'nodemailer';

interface EmailOptions {
  para: string;
  assunto: string;
  html: string;
  texto?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    // Configurar transporter com variáveis de ambiente
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpHost && smtpUser && smtpPass) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
    }
  }

  async enviar(opcoes: EmailOptions): Promise<{ sucesso: boolean; erro?: string }> {
    if (!this.transporter) {
      console.warn('[EmailService] SMTP não configurado. Email não enviado.');
      return {
        sucesso: false,
        erro: 'SMTP não configurado',
      };
    }

    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@comunidade-rp.com',
        to: opcoes.para,
        subject: opcoes.assunto,
        html: opcoes.html,
        text: opcoes.texto,
      });

      console.log('[EmailService] Email enviado para:', opcoes.para);
      return { sucesso: true };
    } catch (error) {
      console.error('[EmailService] Erro ao enviar email:', error);
      return {
        sucesso: false,
        erro: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  async enviarRecuperacaoSenha(email: string, token: string): Promise<{ sucesso: boolean; erro?: string }> {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-senha/${token}`;

    const html = `
      <h2>Recuperação de Senha</h2>
      <p>Você solicitou uma recuperação de senha. Clique no link abaixo para continuar:</p>
      <a href="${resetUrl}">Recuperar Senha</a>
      <p>Este link expira em 1 hora.</p>
      <p>Se não solicitou isso, ignore este email.</p>
    `;

    return this.enviar({
      para: email,
      assunto: 'Recuperação de Senha - COMUNIDADE RP',
      html,
    });
  }

  async enviarCertificado(email: string, nomeCurso: string, numeroSerie: string): Promise<{ sucesso: boolean; erro?: string }> {
    const html = `
      <h2>Parabéns!</h2>
      <p>Você concluiu o curso: <strong>${nomeCurso}</strong></p>
      <p>Número do Certificado: ${numeroSerie}</p>
      <p>Você pode visualizar seu certificado no seu perfil.</p>
    `;

    return this.enviar({
      para: email,
      assunto: `Certificado de Conclusão - ${nomeCurso}`,
      html,
    });
  }

  async enviarBemVindo(email: string, nome: string): Promise<{ sucesso: boolean; erro?: string }> {
    const html = `
      <h2>Bem-vindo à COMUNIDADE RP!</h2>
      <p>Olá ${nome},</p>
      <p>Sua conta foi criada com sucesso. Você já pode acessar todos os nossos cursos.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/login">Fazer Login</a>
    `;

    return this.enviar({
      para: email,
      assunto: 'Bem-vindo à COMUNIDADE RP',
      html,
    });
  }

  /**
   * Validar se email service está funcional
   */
  async validar(): Promise<{ funcional: boolean; erro?: string }> {
    if (!this.transporter) {
      return {
        funcional: false,
        erro: 'SMTP não configurado',
      };
    }

    try {
      await this.transporter.verify();
      return { funcional: true };
    } catch (error) {
      return {
        funcional: false,
        erro: error instanceof Error ? error.message : 'Erro de conexão',
      };
    }
  }
}

export const emailService = new EmailService();
