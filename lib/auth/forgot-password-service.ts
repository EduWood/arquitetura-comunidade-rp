import { PrismaClient } from '@prisma/client';
import { PasswordService } from './password-service';
import { AuthError, AuthErrorCodes } from './errors';
import crypto from 'crypto';

const prisma = new PrismaClient();

// ========================================
// Forgot Password Service
// ========================================

export class ForgotPasswordService {
  /**
   * Request password reset
   */
  static async requestPasswordReset(email: string): Promise<{ message: string }> {
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
        usuarioId: user.id,
        token: resetTokenHash,
        expiresAt,
        usado: false,
      },
    });

    // TODO: Send reset email with token
    // const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

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
        expiresAt: {
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
    confirmPassword: string
  ): Promise<{ message: string }> {
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

    // Verify token
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const resetToken = await prisma.tokenRecuperacao.findFirst({
      where: {
        token: tokenHash,
        usado: false,
        expiresAt: {
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
    const senhaHash = await PasswordService.hashPassword(newPassword);

    // Update user password and mark token as used
    await Promise.all([
      prisma.usuario.update({
        where: { id: resetToken.usuarioId },
        data: { senhaHash },
      }),
      prisma.tokenRecuperacao.update({
        where: { id: resetToken.id },
        data: { usado: true },
      }),
      prisma.sessaoJWT.updateMany({
        where: { usuarioId: resetToken.usuarioId },
        data: { ativa: false },
      }),
    ]);

    return {
      message: 'Senha alterada com sucesso. Faça login com sua nova senha',
    };
  }
}
