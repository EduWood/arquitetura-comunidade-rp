import { PasswordService } from './password-service';
import { JWTService } from './jwt-service';
import { AuthError, AuthErrorCodes } from './errors';
import { auditLoginSuccess, auditLoginFailure, auditLoginBlocked, extractIP } from '@/lib/audit-logger';
import { checkLoginRateLimit, resetLoginRateLimit } from '@/lib/rate-limiting';
import { nanoid } from 'nanoid';

// Lazy load Prisma to avoid initialization during build
let prismaInstance: any = null;
async function getPrisma() {
  if (!prismaInstance) {
    const { prisma } = await import('@/lib/db');
    prismaInstance = prisma;
  }
  return prismaInstance;
}

// ========================================
// Login Service
// ========================================

export class LoginService {
  /**
   * Authenticate user and create session
   */
  static async login(
    email: string,
    password: string,
    userAgent?: string,
    ipAddress?: string,
    rememberMe: boolean = false,
    request?: Request
  ) {
    // Get Prisma instance
    const prisma = await getPrisma();

    // Check rate limiting
    const rateLimit = await checkLoginRateLimit(email);
    if (!rateLimit.success) {
      await auditLoginBlocked(email, ipAddress || 'unknown', userAgent || 'unknown', 'Rate limit exceeded');
      throw new AuthError(
        AuthErrorCodes.USER_LOCKED,
        `Muitas tentativas de login. Tente novamente em ${rateLimit.retryAfter} segundos`,
        429
      );
    }

    // Find user
    const user = await prisma.usuario.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      await auditLoginFailure(email, ipAddress || 'unknown', userAgent || 'unknown', 'User not found');
      throw new AuthError(
        AuthErrorCodes.INVALID_CREDENTIALS,
        'Email ou senha incorretos',
        401
      );
    }

    // Check if user is locked
    if (user.bloqueado_ate && user.bloqueado_ate > new Date()) {
      await auditLoginBlocked(email, ipAddress || 'unknown', userAgent || 'unknown', 'User account locked');
      throw new AuthError(
        AuthErrorCodes.USER_LOCKED,
        'Usuário bloqueado por múltiplas tentativas. Tente novamente mais tarde',
        429
      );
    }

    // Verify password
    const isValidPassword = await PasswordService.verifyPassword(password, user.senha_hash);

    if (!isValidPassword) {
      await auditLoginFailure(email, ipAddress || 'unknown', userAgent || 'unknown', 'Invalid password');
      throw new AuthError(
        AuthErrorCodes.INVALID_CREDENTIALS,
        'Email ou senha incorretos',
        401
      );
    }

    // Generate unique session ID
    const sessionId = nanoid();

    // Generate tokens
    const accessToken = JWTService.generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      sessionId,
    });

    const refreshToken = JWTService.generateRefreshToken({
      userId: user.id,
      sessionId,
    });

    // Create session
    const expiresAt = new Date(
      Date.now() + (rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000)
    );

    await prisma.sessaoJWT.create({
      data: {
        session_id: sessionId,
        usuario_id: user.id,
        token: accessToken,
        refresh_token: refreshToken,
        ip_address: ipAddress || null,
        user_agent: userAgent?.substring(0, 500) || null,
        expires_at: expiresAt,
      },
    });

    // Update user last login
    await prisma.usuario.update({
      where: { id: user.id },
      data: {
        ultima_login: new Date(),
      },
    });

    // Reset rate limiting
    await resetLoginRateLimit(email);

    // Audit log
    await auditLoginSuccess(user.id, ipAddress || 'unknown', userAgent || 'unknown');

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        nome: user.nome,
        role: user.role,
      },
    };
  }
}
