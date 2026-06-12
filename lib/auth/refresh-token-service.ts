import { PrismaClient } from '@prisma/client';
import { JWTService } from './jwt-service';
import { AuthError, AuthErrorCodes } from './errors';

const prisma = new PrismaClient();

// ========================================
// Refresh Token Service
// ========================================

export class RefreshTokenService {
  /**
   * Refresh access token using refresh token
   */
  static async refreshAccessToken(refreshToken: string, userAgent?: string, ipAddress?: string) {
    // Verify refresh token
    const payload = JWTService.verifyRefreshToken(refreshToken);

    if (!payload) {
      throw new AuthError(
        AuthErrorCodes.INVALID_REFRESH_TOKEN,
        'Token de atualização inválido',
        401
      );
    }

    // Find session
    const session = await prisma.sessaoJWT.findUnique({
      where: { id: payload.sessionId },
      include: { usuario: true },
    });

    if (!session || !session.ativa) {
      throw new AuthError(
        AuthErrorCodes.SESSION_EXPIRED,
        'Sessão expirada',
        401
      );
    }

    if (session.expiresAt < new Date()) {
      await prisma.sessaoJWT.update({
        where: { id: session.id },
        data: { ativa: false },
      });

      throw new AuthError(
        AuthErrorCodes.SESSION_EXPIRED,
        'Sessão expirada',
        401
      );
    }

    const user = session.usuario;

    // Generate new tokens
    const newAccessToken = JWTService.generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role as any,
      sessionId: payload.sessionId,
    });

    const newRefreshToken = JWTService.generateRefreshToken({
      userId: user.id,
      sessionId: payload.sessionId,
    });

    // Update session
    await prisma.sessaoJWT.update({
      where: { id: session.id },
      data: {
        token: newRefreshToken,
        userAgent: userAgent?.substring(0, 500) || session.userAgent,
        ipAddress: ipAddress || session.ipAddress,
      },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
}
