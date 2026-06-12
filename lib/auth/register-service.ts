import { prisma } from '@/lib/db';
import { PasswordService } from './password-service';
import { ValidationHelper } from './helpers';
import { AuthError, AuthErrorCodes } from './errors';
import { auditRegistrationSuccess, auditRegistrationFailure } from '@/lib/audit-logger';
import { checkRegisterRateLimit } from '@/lib/rate-limiting';

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
    confirmPassword: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    // Check registration rate limit (optional - if Redis not configured, skip)
    try {
      const rateLimit = await checkRegisterRateLimit(email);
      if (!rateLimit.success) {
        await auditRegistrationFailure(email, ipAddress || 'unknown', 'Rate limit exceeded');
        throw new AuthError(
          AuthErrorCodes.VALIDATION_ERROR,
          'Muitas tentativas de registro. Tente novamente mais tarde',
          429
        );
      }
    } catch (error) {
      // Se rate limit falhar (Redis não disponível), continua o registro
      console.warn('[AUTH] Rate limit check failed, continuing registration:', error);
    }

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
        'Senha fraca',
        400,
        { errors: passwordValidation.errors }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.usuario.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      await auditRegistrationFailure(email, ipAddress || 'unknown', 'Email already exists');
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
    });

    // Audit log - success (optional, non-blocking)
    try {
      await auditRegistrationSuccess(user.id, user.email, ipAddress || 'unknown');
    } catch (error) {
      console.warn('[AUTH] Audit log failed:', error);
    }

    return {
      id: user.id,
      nome: user.nome,
      email: user.email,
      role: user.role,
    };
  }
}
