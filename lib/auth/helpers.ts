// ========================================
// Validation Helper
// ========================================

export class ValidationHelper {
  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate required fields
   */
  static validateRequired(fields: Record<string, any>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const [key, value] of Object.entries(fields)) {
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        errors.push(`${key} é obrigatório`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate string length
   */
  static validateLength(value: string, min: number, max: number): boolean {
    return value.length >= min && value.length <= max;
  }

  /**
   * Sanitize email
   */
  static sanitizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  /**
   * Sanitize name
   */
  static sanitizeName(name: string): string {
    return name.trim().substring(0, 100);
  }
}

// ========================================
// Security Helper
// ========================================

export class SecurityHelper {
  /**
   * Extract bearer token from header
   */
  static extractBearerToken(authHeader?: string): string | null {
    if (!authHeader) return null;

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1];
  }

  /**
   * Get client IP from request
   */
  static getClientIP(headers: Headers): string {
    const forwarded = headers.get('x-forwarded-for');
    if (forwarded) {
      return forwarded.split(',')[0];
    }
    return headers.get('x-real-ip') || 'unknown';
  }

  /**
   * Get user agent from request
   */
  static getUserAgent(headers: Headers): string | null {
    return headers.get('user-agent');
  }

  /**
   * Rate limiting key generator
   */
  static generateRateLimitKey(identifier: string, action: string): string {
    return `ratelimit:${action}:${identifier}`;
  }
}

// ========================================
// Response Helper
// ========================================

export class ResponseHelper {
  /**
   * Success response
   */
  static success(data: any, message: string = 'Sucesso'): any {
    return {
      success: true,
      message,
      data,
    };
  }

  /**
   * Error response
   */
  static error(code: string, message: string, statusCode: number = 400, details?: any): any {
    return {
      success: false,
      code,
      message,
      statusCode,
      details,
    };
  }
}
