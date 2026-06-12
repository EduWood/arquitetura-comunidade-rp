import { prisma } from '@/lib/db';
import { PasswordService } from './password-service';
import { ValidationHelper } from './helpers';
import { AuthError, AuthErrorCodes } from './errors';

// ========================================
// Register Service (Simplified)
// ========================================

export class RegisterService {
  /**
   * Register new user - simplified version without rate limiting and audit logging
   */
  static async register(
    nome: string,
    email: string,
    password: string,
    confirmPassword: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    // Validate name
    if (!nome || nome.trim().length < 3) {
      throw new AuthError(
        AuthErrorCodes.VALIDATION_ERROR,
        'Nome deve ter no mínimo 3 caracteres',
        400
      );
    }

    // Validate email
    if (!email || !ValidationHelper.isValidEmail(email)) {
      throw new AuthError(
        AuthErrorCodes.VALIDATION_ERROR,
        'Email inválido',
        400
      );
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      throw new AuthError(
        AuthErrorCodes.VALIDATION_ERROR,
        'Senhas não correspondem',
        400
      );
    }

    // Validate password strength
    const passwordValidation = PasswordService.validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      throw new AuthError(
        AuthErrorCodes.VALIDATION_ERROR,
        'Senha fraca. Mínimo 8 caracteres, 1 maiúscula, 1 minúscula, 1 número e 1 caractere especial',
        400,
        { errors: passwordValidation.errors }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.usuario.findUnique({
      where: { email: email.toLowerCase() },
    }).catch((err) => {
      console.error('[RegisterService] Erro ao verificar email:', err);
      throw err;
    });

    if (existingUser) {
      throw new AuthError(
        AuthErrorCodes.EMAIL_ALREADY_EXISTS,
        'Este email já está registrado',
        409
      );
    }

    // Hash password
    const senha_hash = await PasswordService.hashPassword(password);

    // Create user
    const user = await prisma.usuario.create({
      data: {
        nome: nome.trim(),
        email: email.toLowerCase(),
        senha_hash,
        role: 'MEMBRO',
        status: 'ATIVO',
        assinatura_ativa: false,
      },
    }).catch((err) => {
      console.error('[RegisterService] Erro ao criar usuário:', err);
      throw err;
    });

    return {
      id: user.id,
      nome: user.nome,
      email: user.email,
      role: user.role,
    };
  }
}
