import jwt, { Secret } from 'jsonwebtoken';
import { JWTPayload, JWTRefreshPayload } from './types';

interface DecodedToken {
  exp?: number;
  [key: string]: any;
}

// ========================================
// JWT Service
// ========================================

export class JWTService {
  private static secret: Secret | null = null;
  private static expiration: string;
  private static refreshExpiration: string;
  private static initialized = false;

  // Lazy initialization - only validate when actually used
  private static initialize() {
    if (this.initialized) return;

    if (!process.env.JWT_SECRET) {
      throw new Error(
        'CRITICAL: JWT_SECRET environment variable is required. Add JWT_SECRET to your .env file.'
      );
    }

    this.secret = process.env.JWT_SECRET;
    this.expiration = process.env.JWT_EXPIRATION || '24h';
    this.refreshExpiration = process.env.JWT_REFRESH_EXPIRATION || '7d';
    this.initialized = true;
  }

  /**
   * Generate Access Token
   */
  static generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    this.initialize();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (jwt.sign as any)(
      payload,
      this.secret,
      {
        expiresIn: this.expiration,
        algorithm: 'HS256',
      }
    );
  }

  /**
   * Generate Refresh Token
   */
  static generateRefreshToken(payload: Omit<JWTRefreshPayload, 'iat' | 'exp'>): string {
    this.initialize();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (jwt.sign as any)(
      payload,
      this.secret,
      {
        expiresIn: this.refreshExpiration,
        algorithm: 'HS256',
      }
    );
  }

  /**
   * Verify Access Token
   */
  static verifyAccessToken(token: string): JWTPayload | null {
    this.initialize();
    try {
      const decoded = jwt.verify(token, this.secret!, {
        algorithms: ['HS256'],
      });
      return decoded as JWTPayload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Verify Refresh Token
   */
  static verifyRefreshToken(token: string): JWTRefreshPayload | null {
    this.initialize();
    try {
      const decoded = jwt.verify(token, this.secret!, {
        algorithms: ['HS256'],
      });
      return decoded as JWTRefreshPayload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Decode token without verification (for debugging)
   */
  static decode(token: string): DecodedToken | null {
    return jwt.decode(token) as DecodedToken | null;
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(token: string): boolean {
    try {
      const decoded = this.decode(token);
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
      const decoded = this.decode(token);
      if (!decoded || !decoded.exp) return 0;
      return Math.max(0, decoded.exp * 1000 - Date.now());
    } catch {
      return 0;
    }
  }
}
