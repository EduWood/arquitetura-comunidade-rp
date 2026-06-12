import { PrismaClient } from '@prisma/client';
import { PasswordService } from './password-service';
import { JWTService } from './jwt-service';
import { AuthError, AuthErrorCodes } from './errors';

const prisma = new PrismaClient();

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
    rememberMe: boolean = false
  ) {
    // Find user
    const user = await prisma.usuario.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new AuthError(
        AuthErrorCodes.INVALID_CREDENTIALS,
        'Email ou senha incorretos',
        401
      );
    }

    // Check if user is locked
    if (user.bloqueadoAte && user.bloqueadoAte > new Date()) {
      throw new AuthError(
        AuthErrorCodes.USER_LOCKED,
        'Usuário bloqueado por múltiplas tentativas. Tente novamente mais tarde',
        429
      );
    }

    // Verify password
    const isValidPassword = await PasswordService.verifyPassword(password, user.senhaHash);

    if (!isValidPassword) {
      // Increment failed login attempts
      const novasTentativas = (user.tentativasLogin || 0) + 1;
      const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5');
      const lockTimeMinutes = parseInt(process.env.LOGIN_LOCK_TIME_MINUTES || '15');

      let bloqueadoAte = null;
      if (novasTentativas >= maxAttempts) {
        bloqueadoAte = new Date(Date.now() + lockTimeMinutes * 60 * 1000);
      }

      await prisma.usuario.update({
        where: { id: user.id },
        data: {
          tentativasLogin: novasTentativas,
          bloqueadoAte,
        },
      });

      throw new AuthError(
        AuthErrorCodes.INVALID_CREDENTIALS,
        'Email ou senha incorretos',
        401
      );
    }

    // Check if email is verified
    if (!user.emailVerificado && process.env.EMAIL_VERIFICATION_ENABLED === 'true') {
      throw new AuthError(
        AuthErrorCodes.EMAIL_NOT_VERIFIED,
        'Email não verificado. Verifique seu email',
        403
      );
    }

    // Reset failed login attempts
    await prisma.usuario.update({
      where: { id: user.id },
      data: {
        tentativasLogin: 0,
        bloqueadoAte: null,
        ultimoAcesso: new Date(),
      },
    });

    // Generate tokens
    const accessToken = JWTService.generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role as any,
      sessionId: `session_${Date.now()}`,
    });

    const refreshToken = JWTService.generateRefreshToken({
      userId: user.id,
      sessionId: `session_${Date.now()}`,
    });

    // Create session
    const expiresAt = new Date(Date.now() + (rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000));

    await prisma.sessaoJWT.create({
      data: {
        usuarioId: user.id,
        token: refreshToken,
        expiresAt,
        userAgent: userAgent?.substring(0, 500) || null,
        ipAddress: ipAddress || null,
        ativa: true,
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        nome: user.nome,
        role: user.role,
        emailVerificado: user.emailVerificado,
      },
    };
  }

  /**
   * Logout user by session ID
   */
  static async logout(sessionId: string) {
    await prisma.sessaoJWT.updateMany({
      where: { id: sessionId },
      data: { ativa: false },
    });
  }
}
