import { PasswordService } from './password-service';
import { JWTService } from './jwt-service';
import { AuthError, AuthErrorCodes } from './errors';
import { nanoid } from 'nanoid';
import { prisma } from '@/lib/db';

// ========================================
// Login Service
// ========================================

export class LoginService {
  /**
   * Authenticate user and create session - simplified without rate limiting and audit logging
   */
  static async login(
    email: string,
    password: string,
    userAgent?: string,
    ipAddress?: string,
    rememberMe: boolean = false,
    request?: Request
  ) {
    // Find user
    const user = await prisma.usuario.findUnique({
      where: { email: email.toLowerCase() },
    }).catch((err) => {
      console.error('[LoginService] Erro ao buscar usuário:', err);
      throw err;
    });

    if (!user) {
      throw new AuthError(
        AuthErrorCodes.INVALID_CREDENTIALS,
        'Email ou senha incorretos',
        401
      );
    }

    // Check if user is locked
    if (user.bloqueado_ate && user.bloqueado_ate > new Date()) {
      throw new AuthError(
        AuthErrorCodes.USER_LOCKED,
        'Usuário bloqueado por múltiplas tentativas. Tente novamente mais tarde',
        429
      );
    }

    // Verify password
    const isValidPassword = await PasswordService.verifyPassword(password, user.senha_hash);

    if (!isValidPassword) {
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
    }).catch((err) => {
      console.error('[LoginService] Erro ao criar sessão:', err);
      throw err;
    });

    // Update user last login
    await prisma.usuario.update({
      where: { id: user.id },
      data: {
        ultima_login: new Date(),
      },
    }).catch((err) => {
      console.error('[LoginService] Erro ao atualizar última login:', err);
    });

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
