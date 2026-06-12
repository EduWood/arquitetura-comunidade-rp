import jwt from 'jsonwebtoken';
import { JWTPayload, JWTRefreshPayload } from './types';

// ========================================
// JWT Service
// ========================================

export class JWTService {
  private static secret: string;
  private static expiration: string;
  private static refreshExpiration: string;

  static {
    // Validate JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      throw new Error(
        'CRITICAL: JWT_SECRET environment variable is required. Add JWT_SECRET to your .env file.'
      );
    }

    this.secret = process.env.JWT_SECRET;
    this.expiration = process.env.JWT_EXPIRATION || '24h';
    this.refreshExpiration = process.env.JWT_REFRESH_EXPIRATION || '7d';
  }

  /**
   * Generate Access Token
   */
  static generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, this.secret, {
      expiresIn: this.expiration,
      algorithm: 'HS256',
    });
  }

  /**
   * Generate Refresh Token
   */
  static generateRefreshToken(payload: Omit<JWTRefreshPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, this.secret, {
      expiresIn: this.refreshExpiration,
      algorithm: 'HS256',
    });
  }

  /**
   * Verify Access Token
   */
  static verifyAccessToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, this.secret, {
        algorithms: ['HS256'],
      }) as JWTPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  }

  /**
   * Verify Refresh Token
   */
  static verifyRefreshToken(token: string): JWTRefreshPayload | null {
    try {
      const decoded = jwt.verify(token, this.secret, {
        algorithms: ['HS256'],
      }) as JWTRefreshPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  }

  /**
   * Decode token without verification (for debugging)
   */
  static decode(token: string): any {
    return jwt.decode(token);
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as any;
      if (!decoded || !decoded.exp) return true;
      return decoded.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  /**
   * Get remaining time in milliseconds
   */
  static getTokenTimeRemaining(token: string): number {
    try {
      const decoded = jwt.decode(token) as any;
      if (!decoded || !decoded.exp) return 0;
      return Math.max(0, decoded.exp * 1000 - Date.now());
    } catch {
      return 0;
    }
  }
}
