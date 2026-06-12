import { prisma } from '@/lib/db';
import { JWTService } from './jwt-service';
import { AuthError, AuthErrorCodes } from './errors';
import { auditTokenRefresh, auditTokenRefreshFailure } from '@/lib/audit-logger';

// ========================================
// Refresh Token Service
// ========================================

export class RefreshTokenService {
  /**
   * Refresh access token using refresh token
   */
  static async refreshAccessToken(
    refreshToken: string,
    userAgent?: string,
    ipAddress?: string
  ) {
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
      where: { session_id: payload.sessionId },
      include: { usuario: true },
    });

    if (!session || session.revogado) {
      await auditTokenRefreshFailure(payload.userId || 'unknown', ipAddress || 'unknown', 'Session not found');
      throw new AuthError(
        AuthErrorCodes.SESSION_EXPIRED,
        'Sessão expirada',
        401
      );
    }

    // Check if session is expired
    if (session.expires_at < new Date()) {
      await prisma.sessaoJWT.update({
        where: { id: session.id },
        data: { revogado: true },
      });

      await auditTokenRefreshFailure(payload.userId || 'unknown', ipAddress || 'unknown', 'Session expired');
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
      role: user.role,
      sessionId: payload.sessionId,
    });

    const newRefreshToken = JWTService.generateRefreshToken({
      userId: user.id,
      sessionId: payload.sessionId,
    });

    // Update session with new tokens
    await prisma.sessaoJWT.update({
      where: { id: session.id },
      data: {
        token: newAccessToken,
        refresh_token: newRefreshToken,
        user_agent: userAgent?.substring(0, 500) || session.user_agent,
        ip_address: ipAddress || session.ip_address,
        updated_at: new Date(),
      },
    });

    // Audit log
    await auditTokenRefresh(user.id, ipAddress || 'unknown');

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
}
