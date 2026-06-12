import { PrismaClient } from '@prisma/client';
import { PasswordService } from './password-service';
import { AuthError, AuthErrorCodes } from './errors';

const prisma = new PrismaClient();

// ========================================
// Auth Service (Main orchestrator)
// ========================================

export class AuthService {
  /**
   * Verify user credentials
   */
  static async verifyCredentials(email: string, password: string) {
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

    const isValid = await PasswordService.verifyPassword(password, user.senhaHash);

    if (!isValid) {
      throw new AuthError(
        AuthErrorCodes.INVALID_CREDENTIALS,
        'Email ou senha incorretos',
        401
      );
    }

    return user;
  }

  /**
   * Get user profile
   */
  static async getUserProfile(userId: string) {
    const user = await prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        emailVerificado: true,
        ativo: true,
        criadoEm: true,
        ultimoAcesso: true,
      },
    });

    if (!user) {
      throw new AuthError(
        AuthErrorCodes.USER_NOT_FOUND,
        'Usuário não encontrado',
        404
      );
    }

    return user;
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(
    userId: string,
    data: {
      nome?: string;
      email?: string;
    }
  ) {
    // Validate email if provided
    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        throw new AuthError(
          AuthErrorCodes.VALIDATION_ERROR,
          'Email inválido',
          400
        );
      }

      // Check if email is already in use
      const existingUser = await prisma.usuario.findUnique({
        where: { email: data.email.toLowerCase() },
      });

      if (existingUser && existingUser.id !== userId) {
        throw new AuthError(
          AuthErrorCodes.EMAIL_ALREADY_EXISTS,
          'Este email já está em uso',
          409
        );
      }

      data.email = data.email.toLowerCase();
    }

    const user = await prisma.usuario.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        emailVerificado: true,
        ativo: true,
      },
    });

    return user;
  }

  /**
   * Change password
   */
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ) {
    const user = await prisma.usuario.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AuthError(
        AuthErrorCodes.USER_NOT_FOUND,
        'Usuário não encontrado',
        404
      );
    }

    // Verify current password
    const isValid = await PasswordService.verifyPassword(currentPassword, user.senhaHash);

    if (!isValid) {
      throw new AuthError(
        AuthErrorCodes.INVALID_PASSWORD,
        'Senha atual incorreta',
        401
      );
    }

    if (newPassword !== confirmPassword) {
      throw new AuthError(
        AuthErrorCodes.VALIDATION_ERROR,
        'Senhas não correspondem',
        400
      );
    }

    const passwordValidation = PasswordService.validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      throw new AuthError(
        AuthErrorCodes.VALIDATION_ERROR,
        'Senha fraca',
        400,
        { details: passwordValidation.errors }
      );
    }

    const senhaHash = await PasswordService.hashPassword(newPassword);

    await Promise.all([
      prisma.usuario.update({
        where: { id: userId },
        data: { senhaHash },
      }),
      // Invalidate all sessions
      prisma.sessaoJWT.updateMany({
        where: { usuarioId: userId },
        data: { ativa: false },
      }),
    ]);

    return { message: 'Senha alterada com sucesso' };
  }

  /**
   * Verify email (for email verification feature)
   */
  static async verifyEmail(userId: string) {
    await prisma.usuario.update({
      where: { id: userId },
      data: { emailVerificado: true },
    });

    return { message: 'Email verificado com sucesso' };
  }
}
