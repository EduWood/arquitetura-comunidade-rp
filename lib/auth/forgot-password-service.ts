import { prisma } from '@/lib/db';
import { PasswordService } from './password-service';
import { AuthError, AuthErrorCodes } from './errors';
import { auditPasswordReset, checkPasswordResetRateLimit } from '@/lib/audit-logger';
import crypto from 'crypto';

// ========================================
// Forgot Password Service
// ========================================

export class ForgotPasswordService {
  /**
   * Request password reset
   */
  static async requestPasswordReset(email: string, ipAddress?: string): Promise<{ message: string }> {
    // Check rate limit (3 requests per hour)
    const rateLimit = await checkPasswordResetRateLimit(email);
    if (!rateLimit) {
      // Still return success message for security (email enumeration prevention)
      return {
        message: 'Se este email estiver registrado, você receberá um link de recuperação',
      };
    }

    const user = await prisma.usuario.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success for security reasons (prevents email enumeration)
    if (!user) {
      return {
        message: 'Se este email estiver registrado, você receberá um link de recuperação',
      };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    // Save reset token
    await prisma.tokenRecuperacao.create({
      data: {
        usuario_id: user.id,
        token: resetTokenHash,
        expires_at: expiresAt,
        usado: false,
      },
    });

    // TODO: Send reset email with token
    // const resetLink = `${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password?token=${resetToken}`;

    await auditPasswordReset(user.id, 'forgot_password_requested', ipAddress);

    return {
      message: 'Se este email estiver registrado, você receberá um link de recuperação',
    };
  }

  /**
   * Verify reset token
   */
  static async verifyResetToken(token: string): Promise<{ userId: string; email: string }> {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const resetToken = await prisma.tokenRecuperacao.findFirst({
      where: {
        token: tokenHash,
        usado: false,
        expires_at: {
          gt: new Date(),
        },
      },
      include: { usuario: true },
    });

    if (!resetToken) {
      throw new AuthError(
        AuthErrorCodes.INVALID_TOKEN,
        'Link de recuperação inválido ou expirado',
        400
      );
    }

    return {
      userId: resetToken.usuario.id,
      email: resetToken.usuario.email,
    };
  }

  /**
   * Reset password with token
   */
  static async resetPassword(
    token: string,
    newPassword: string,
    confirmPassword: string,
    ipAddress?: string
  ): Promise<{ message: string }> {
    // Validate passwords match
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

    // Verify token and get user
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const resetToken = await prisma.tokenRecuperacao.findFirst({
      where: {
        token: tokenHash,
        usado: false,
        expires_at: {
          gt: new Date(),
        },
      },
    });

    if (!resetToken) {
      throw new AuthError(
        AuthErrorCodes.INVALID_TOKEN,
        'Link de recuperação inválido ou expirado',
        400
      );
    }

    // Hash new password
    const senha_hash = await PasswordService.hashPassword(newPassword);

    // Update user password, mark token as used, and revoke all sessions
    await Promise.all([
      prisma.usuario.update({
        where: { id: resetToken.usuario_id },
        data: { senha_hash },
      }),
      prisma.tokenRecuperacao.update({
        where: { id: resetToken.id },
        data: { usado: true },
      }),
      prisma.sessaoJWT.updateMany({
        where: { usuario_id: resetToken.usuario_id },
        data: { revogado: true },
      }),
    ]);

    await auditPasswordReset(resetToken.usuario_id, 'password_reset_completed', ipAddress);

    return {
      message: 'Senha alterada com sucesso. Faça login com sua nova senha',
    };
  }
}
