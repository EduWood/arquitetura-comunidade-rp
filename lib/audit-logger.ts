import { prisma } from './db';

export enum AuditAction {
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  LOGIN_BLOCKED = 'LOGIN_BLOCKED',
  REGISTER = 'REGISTER',
  LOGOUT = 'LOGOUT',
  REFRESH_TOKEN = 'REFRESH_TOKEN',
  FORGOT_PASSWORD = 'FORGOT_PASSWORD',
  RESET_PASSWORD = 'RESET_PASSWORD',
  RESET_PASSWORD_FAILED = 'RESET_PASSWORD_FAILED',
  CHANGE_PASSWORD = 'CHANGE_PASSWORD',
  PROFILE_UPDATE = 'PROFILE_UPDATE',
  PERMISSION_GRANTED = 'PERMISSION_GRANTED',
  PERMISSION_REVOKED = 'PERMISSION_REVOKED',
}

export interface AuditLog {
  usuario_id: string;
  acao: AuditAction;
  descricao?: string;
  ip_address?: string;
  user_agent?: string;
  dados_adicionais?: Record<string, any>;
}

/**
 * Registrar ação de auditoria
 */
export async function auditLog(log: AuditLog): Promise<void> {
  try {
    await prisma.logAuditoria.create({
      data: {
        usuario_id: log.usuario_id,
        acao: log.acao,
        descricao: log.descricao,
        ip_address: log.ip_address,
        user_agent: log.user_agent,
        dados_adicionais: log.dados_adicionais ? JSON.stringify(log.dados_adicionais) : null,
      },
    });
  } catch (error) {
    console.error('[AuditLogger] Erro ao registrar auditoria:', error);
    // Não lançar erro - logging não deve quebrar fluxo
  }
}

/**
 * Extrair IP da requisição
 */
export function extractIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Fallback para URL da requisição
  try {
    return new URL(request.url).hostname || 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * Extrair User-Agent da requisição
 */
export function extractUserAgent(request: Request): string {
  return request.headers.get('user-agent') || 'unknown';
}

/**
 * Wrappers de conveniência
 */

export async function auditLoginSuccess(
  usuarioId: string,
  ip: string,
  userAgent: string
): Promise<void> {
  await auditLog({
    usuario_id: usuarioId,
    acao: AuditAction.LOGIN_SUCCESS,
    descricao: 'Login bem-sucedido',
    ip_address: ip,
    user_agent: userAgent,
  });
}

export async function auditLoginFailure(
  email: string,
  ip: string,
  userAgent: string,
  reason: string
): Promise<void> {
  await auditLog({
    usuario_id: 'unknown',
    acao: AuditAction.LOGIN_FAILURE,
    descricao: `Falha no login: ${reason}`,
    ip_address: ip,
    user_agent: userAgent,
    dados_adicionais: { email },
  });
}

export async function auditLoginBlocked(
  email: string,
  ip: string,
  userAgent: string,
  reason: string
): Promise<void> {
  await auditLog({
    usuario_id: 'unknown',
    acao: AuditAction.LOGIN_BLOCKED,
    descricao: `Login bloqueado: ${reason}`,
    ip_address: ip,
    user_agent: userAgent,
    dados_adicionais: { email },
  });
}

export async function auditRegister(
  usuarioId: string,
  email: string,
  ip: string,
  userAgent: string
): Promise<void> {
  await auditLog({
    usuario_id: usuarioId,
    acao: AuditAction.REGISTER,
    descricao: 'Novo usuário registrado',
    ip_address: ip,
    user_agent: userAgent,
    dados_adicionais: { email },
  });
}

export async function auditLogout(
  usuarioId: string,
  ip: string,
  userAgent: string
): Promise<void> {
  await auditLog({
    usuario_id: usuarioId,
    acao: AuditAction.LOGOUT,
    descricao: 'Logout realizado',
    ip_address: ip,
    user_agent: userAgent,
  });
}

export async function auditResetPassword(
  usuarioId: string,
  success: boolean,
  ip: string,
  userAgent: string
): Promise<void> {
  await auditLog({
    usuario_id: usuarioId,
    acao: success ? AuditAction.RESET_PASSWORD : AuditAction.RESET_PASSWORD_FAILED,
    descricao: success ? 'Senha redefinida com sucesso' : 'Falha na redefinição de senha',
    ip_address: ip,
    user_agent: userAgent,
  });
}
