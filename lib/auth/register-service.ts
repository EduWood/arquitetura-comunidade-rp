import { PrismaClient } from '@prisma/client';
import { PasswordService } from './password-service';
import { JWTService } from './jwt-service';
import { AuthError, AuthErrorCodes } from './errors';
import { UserRole } from './types';

const prisma = new PrismaClient();

// ========================================
// Register Service
// ========================================

export class RegisterService {
  /**
   * Register new user
   */
  static async register(
    nome: string,
    email: string,
    password: string,
    confirmPassword: string
  ) {
    // Validations
    if (!nome || nome.trim().length < 3) {
      throw new AuthError(
        AuthErrorCodes.VALIDATION_ERROR,
        'Nome deve ter no mínimo 3 caracteres',
        400
      );
    }

    if (!email || !this.isValidEmail(email)) {
      throw new AuthError(
        AuthErrorCodes.VALIDATION_ERROR,
        'Email inválido',
        400
      );
    }

    if (password !== confirmPassword) {
      throw new AuthError(
        AuthErrorCodes.VALIDATION_ERROR,
        'Senhas não correspondem',
        400
      );
    }

    const passwordValidation = PasswordService.validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      throw new AuthError(
        AuthErrorCodes.VALIDATION_ERROR,
        'Senha fraca',
        400,
        { details: passwordValidation.errors }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.usuario.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new AuthError(
        AuthErrorCodes.EMAIL_ALREADY_EXISTS,
        'Este email já está registrado',
        409
      );
    }

    // Hash password
    const senhaHash = await PasswordService.hashPassword(password);

    // Create user
    const user = await prisma.usuario.create({
      data: {
        nome,
        email: email.toLowerCase(),
        senhaHash,
        role: 'MEMBRO' as UserRole,
        emailVerificado: false,
        ativo: true,
        tentativasLogin: 0,
        bloqueadoAte: null,
      },
    });

    // TODO: Send verification email

    return {
      id: user.id,
      nome: user.nome,
      email: user.email,
      role: user.role,
      emailVerificado: user.emailVerificado,
    };
  }

  /**
   * Validate email format
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
