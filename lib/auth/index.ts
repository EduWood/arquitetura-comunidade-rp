// ========================================
// Auth Library - Main Exports
// ========================================

// Services
export { JWTService } from './jwt-service';
export { PasswordService } from './password-service';
export { RegisterService } from './register-service';
export { LoginService } from './login-service';
export { RefreshTokenService } from './refresh-token-service';
export { ForgotPasswordService } from './forgot-password-service';
export { AuthService } from './auth-service';

// Middleware
export { withAuth, getAuthContext, requireAuth } from './middleware';
export { requireRole, requireRoleLevel, requireAdmin, requireSuperAdmin, checkPermission } from './authorization';

// Types
export type { UserRole, JWTPayload, JWTRefreshPayload, AuthResponse, LoginRequest, RegisterRequest, AuthContext, SessionData } from './types';

// Errors
export { AuthError, AuthErrorCodes, ErrorMessages, createErrorResponse } from './errors';

// Helpers
export { ValidationHelper, SecurityHelper, ResponseHelper } from './helpers';
