import { prisma } from '@/lib/db';
import { PasswordService } from './password-service';
import { ValidationHelper } from './helpers';
import { AuthError, AuthErrorCodes } from './errors';
import { auditPasswordChange } from '@/lib/audit-logger';

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

    const isValid = await PasswordService.verifyPassword(password, user.senha_hash);

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
        status: true,
        assinatura_ativa: true,
        created_at: true,
        ultima_login: true,
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
      if (!ValidationHelper.isValidEmail(data.email)) {
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
        status: true,
        assinatura_ativa: true,
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
    confirmPassword: string,
    ipAddress?: string
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
    const isValid = await PasswordService.verifyPassword(currentPassword, user.senha_hash);

    if (!isValid) {
      throw new AuthError(
        AuthErrorCodes.INVALID_PASSWORD,
        'Senha atual incorreta',
        401
      );
    }

    // Validate new passwords match
    if (newPassword !== confirmPassword) {
      throw new AuthError(
        AuthErrorCodes.VALIDATION_ERROR,
        'Senhas não correspondem',
        400
      );
    }

    // Validate password strength
    const passwordValidation = PasswordService.validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      throw new AuthError(
        AuthErrorCodes.VALIDATION_ERROR,
        'Senha fraca',
        400,
        { errors: passwordValidation.errors }
      );
    }

    // Hash new password
    const senha_hash = await PasswordService.hashPassword(newPassword);

    // Update password and revoke all sessions
    await Promise.all([
      prisma.usuario.update({
        where: { id: userId },
        data: { senha_hash },
      }),
      prisma.sessaoJWT.updateMany({
        where: { usuario_id: userId },
        data: { revogado: true },
      }),
    ]);

    await auditPasswordChange(userId, ipAddress);

    return { message: 'Senha alterada com sucesso' };
  }
}
