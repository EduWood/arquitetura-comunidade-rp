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
  usuario_id?: string | null;
  acao: string;
  tabela_afetada: string;
  id_recurso?: string | null;
  valores_antes?: Record<string, any> | null;
  valores_depois?: Record<string, any> | null;
  ip_address?: string;
  user_agent?: string;
}

/**
 * Registrar ação de auditoria
 */
export async function auditLog(log: AuditLog): Promise<void> {
  try {
    await prisma.logAuditoria.create({
      data: {
        usuario_id: log.usuario_id || null,
        acao: log.acao,
        tabela_afetada: log.tabela_afetada,
        id_recurso: log.id_recurso || null,
        valores_antes: log.valores_antes ? JSON.stringify(log.valores_antes) : null,
        valores_depois: log.valores_depois ? JSON.stringify(log.valores_depois) : null,
        ip_address: log.ip_address,
        user_agent: log.user_agent,
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
    acao: 'LOGIN_SUCCESS',
    tabela_afetada: 'Usuario',
    id_recurso: usuarioId,
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
    usuario_id: null,
    acao: 'LOGIN_FAILURE',
    tabela_afetada: 'Usuario',
    valores_depois: { email, reason },
    ip_address: ip,
    user_agent: userAgent,
  });
}

export async function auditLoginBlocked(
  email: string,
  ip: string,
  userAgent: string,
  reason: string
): Promise<void> {
  await auditLog({
    usuario_id: null,
    acao: 'LOGIN_BLOCKED',
    tabela_afetada: 'Usuario',
    valores_depois: { email, reason },
    ip_address: ip,
    user_agent: userAgent,
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
    acao: 'REGISTER',
    tabela_afetada: 'Usuario',
    id_recurso: usuarioId,
    ip_address: ip,
    user_agent: userAgent,
  });
}

export async function auditLogout(
  usuarioId: string,
  ip: string,
  userAgent: string
): Promise<void> {
  await auditLog({
    usuario_id: usuarioId,
    acao: 'LOGOUT',
    tabela_afetada: 'SessaoJWT',
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
    acao: success ? 'RESET_PASSWORD' : 'RESET_PASSWORD_FAILED',
    tabela_afetada: 'Usuario',
    id_recurso: usuarioId,
    ip_address: ip,
    user_agent: userAgent,
  });
}

export async function auditRegistrationSuccess(userId: string, email: string, ipAddress: string) {
  await auditLog({
    usuario_id: userId,
    acao: 'REGISTER',
    tabela_afetada: 'Usuario',
    id_recurso: userId,
    ip_address: ipAddress,
    user_agent: 'registration',
  });
}

export async function auditRegistrationFailure(email: string, ipAddress: string, reason: string) {
  await auditLog({
    usuario_id: null,
    acao: 'REGISTER',
    tabela_afetada: 'Usuario',
    valores_depois: { email, reason },
    ip_address: ipAddress,
    user_agent: 'registration',
  });
}

export async function auditTokenRefresh(userId: string, ipAddress: string) {
  await auditLog({
    usuario_id: userId,
    acao: 'REFRESH_TOKEN',
    tabela_afetada: 'SessaoJWT',
    ip_address: ipAddress,
    user_agent: 'token_refresh',
  });
}

export async function auditTokenRefreshFailure(userId: string, ipAddress: string, reason: string) {
  await auditLog({
    usuario_id: userId || null,
    acao: 'REFRESH_TOKEN',
    tabela_afetada: 'SessaoJWT',
    valores_depois: { reason },
    ip_address: ipAddress,
    user_agent: 'token_refresh',
  });
}

export async function auditPasswordReset(userId: string, action: string, ipAddress?: string) {
  const actionMap: Record<string, string> = {
    forgot_password_requested: 'FORGOT_PASSWORD',
    password_reset_completed: 'RESET_PASSWORD',
  };

  await auditLog({
    usuario_id: userId,
    acao: actionMap[action] || 'RESET_PASSWORD',
    tabela_afetada: 'Usuario',
    id_recurso: userId,
    ip_address: ipAddress || 'unknown',
    user_agent: 'password_reset',
  });
}

export async function auditPasswordChange(userId: string, ipAddress?: string) {
  await auditLog({
    usuario_id: userId,
    acao: 'CHANGE_PASSWORD',
    tabela_afetada: 'Usuario',
    id_recurso: userId,
    ip_address: ipAddress || 'unknown',
    user_agent: 'change_password',
  });
}

export async function checkPasswordResetRateLimit(email: string): Promise<boolean> {
  // For now, we'll allow it. In production, integrate with Redis.
  return true;
}
