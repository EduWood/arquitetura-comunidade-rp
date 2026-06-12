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
  private static secret: Secret;
  private static expiration: string;
  private static refreshExpiration: string;

  private static initializeSecret(): void {
    if (!this.secret) {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        // During build/SSG, JWT_SECRET might not be available
        // But we need it at runtime when tokens are actually generated/verified
        if (typeof window === 'undefined' && !process.env.NODE_ENV?.includes('development')) {
          // Running on server but not in dev mode - this is likely a build step
          // Use a placeholder that will be replaced at runtime
          this.secret = 'build-time-placeholder-will-be-replaced-at-runtime';
        } else {
          throw new Error(
            'CRITICAL: JWT_SECRET environment variable is required. Add JWT_SECRET to your .env file.'
          );
        }
      } else {
        this.secret = secret;
      }
      this.expiration = process.env.JWT_EXPIRATION || '24h';
      this.refreshExpiration = process.env.JWT_REFRESH_EXPIRATION || '7d';
    }
  }

  /**
   * Generate Access Token
   */
  static generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    this.initializeSecret();
    
    // Runtime validation - ensure we have a real secret, not the build placeholder
    if (this.secret === 'build-time-placeholder-will-be-replaced-at-runtime') {
      throw new Error(
        'JWT_SECRET is not configured. Ensure JWT_SECRET environment variable is set in your Vercel project.'
      );
    }
    
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
    this.initializeSecret();
    
    // Runtime validation - ensure we have a real secret, not the build placeholder
    if (this.secret === 'build-time-placeholder-will-be-replaced-at-runtime') {
      throw new Error(
        'JWT_SECRET is not configured. Ensure JWT_SECRET environment variable is set in your Vercel project.'
      );
    }
    
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
    this.initializeSecret();
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
    this.initializeSecret();
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
