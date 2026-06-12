import * as bcrypt from 'bcryptjs';

// ========================================
// Password Hashing
// ========================================

export class PasswordService {
  private static rounds = parseInt(process.env.BCRYPT_ROUNDS || '10');

  /**
   * Hash a password
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.rounds);
  }

  /**
   * Compare password with hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      return false;
    }
  }

  /**
   * Validate password strength
   */
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Senha deve ter no mínimo 8 caracteres');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Senha deve conter pelo menos uma letra maiúscula');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Senha deve conter pelo menos uma letra minúscula');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Senha deve conter pelo menos um número');
    }

    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Senha deve conter pelo menos um caractere especial');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
