// ========================================
// Custom Error Class
// ========================================

export class AuthError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 400,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AuthError';
    Object.setPrototypeOf(this, AuthError.prototype);
  }
}

// ========================================
// Error Types
// ========================================

export const AuthErrorCodes = {
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  INVALID_TOKEN: 'INVALID_TOKEN',
  EXPIRED_TOKEN: 'EXPIRED_TOKEN',
  INVALID_PASSWORD: 'INVALID_PASSWORD',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  USER_LOCKED: 'USER_LOCKED',
  INVALID_REFRESH_TOKEN: 'INVALID_REFRESH_TOKEN',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

// ========================================
// Error Messages
// ========================================

export const ErrorMessages: Record<string, string> = {
  [AuthErrorCodes.INVALID_CREDENTIALS]: 'Email ou senha incorretos',
  [AuthErrorCodes.USER_NOT_FOUND]: 'Usuário não encontrado',
  [AuthErrorCodes.EMAIL_ALREADY_EXISTS]: 'Este email já está registrado',
  [AuthErrorCodes.INVALID_TOKEN]: 'Token inválido',
  [AuthErrorCodes.EXPIRED_TOKEN]: 'Token expirado',
  [AuthErrorCodes.INVALID_PASSWORD]: 'Senha inválida',
  [AuthErrorCodes.EMAIL_NOT_VERIFIED]: 'Email não verificado. Verifique seu email',
  [AuthErrorCodes.USER_LOCKED]: 'Usuário bloqueado por múltiplas tentativas. Tente novamente mais tarde',
  [AuthErrorCodes.INVALID_REFRESH_TOKEN]: 'Token de atualização inválido',
  [AuthErrorCodes.SESSION_EXPIRED]: 'Sessão expirada. Faça login novamente',
  [AuthErrorCodes.UNAUTHORIZED]: 'Não autorizado',
  [AuthErrorCodes.FORBIDDEN]: 'Acesso negado',
  [AuthErrorCodes.VALIDATION_ERROR]: 'Erro de validação',
  [AuthErrorCodes.INTERNAL_ERROR]: 'Erro interno do servidor',
};

// ========================================
// Helper to create standardized error response
// ========================================

export function createErrorResponse(
  code: string,
  statusCode: number = 400,
  details?: Record<string, any>
) {
  const message = ErrorMessages[code] || 'Erro desconhecido';
  return {
    success: false,
    message,
    code,
    statusCode,
    details,
  };
}
