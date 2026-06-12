// ========================================
// Auth Types
// ========================================

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'MEMBRO';

export type EmailTemplateType = 
  | 'VERIFICATION' 
  | 'PASSWORD_RESET' 
  | 'WELCOME' 
  | 'PASSWORD_CHANGED';

// ========================================
// JWT Payloads
// ========================================

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  sessionId: string;
  iat: number;
  exp: number;
}

export interface JWTRefreshPayload {
  userId: string;
  sessionId: string;
  iat: number;
  exp: number;
}

// ========================================
// Auth Response
// ========================================

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    nome: string;
    role: UserRole;
    emailVerificado: boolean;
  };
  accessToken?: string;
  refreshToken?: string;
}

// ========================================
// Login Request
// ========================================

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// ========================================
// Register Request
// ========================================

export interface RegisterRequest {
  nome: string;
  email: string;
  password: string;
  confirmPassword: string;
  aceitaTermos: boolean;
}

// ========================================
// Password Recovery
// ========================================

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// ========================================
// Session
// ========================================

export interface SessionData {
  id: string;
  userId: string;
  sessionToken: string;
  expiresAt: Date;
  userAgent?: string;
  ipAddress?: string;
  rememberMe: boolean;
}

// ========================================
// API Error
// ========================================

export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
  details?: Record<string, any>;
}

// ========================================
// Middleware Context
// ========================================

export interface AuthContext {
  userId: string;
  email: string;
  role: UserRole;
  sessionId: string;
  isAuthenticated: boolean;
}
