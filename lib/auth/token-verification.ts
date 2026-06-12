// Token Verification - Extrai e verifica JWT do header

import { NextRequest } from 'next/server';
import { JWTService } from './jwt-service';

export interface TokenVerificationResult {
  valid: boolean;
  usuarioId?: string;
  email?: string;
  role?: string;
  error?: string;
}

/**
 * Verificar token JWT do header Authorization
 */
export async function verificarToken(
  request: NextRequest
): Promise<TokenVerificationResult> {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        valid: false,
        error: 'Token não fornecido',
      };
    }

    const token = authHeader.substring(7);

    // Verificar e decodificar token
    const payload = JWTService.verifyAccessToken(token);

    if (!payload) {
      return {
        valid: false,
        error: 'Token inválido',
      };
    }

    return {
      valid: true,
      usuarioId: payload.userId,
      email: payload.email,
      role: payload.role,
    };
  } catch (error) {
    console.error('[verificarToken] Erro:', error);
    return {
      valid: false,
      error: 'Erro ao verificar token',
    };
  }
}

/**
 * Extrair ID do usuário do token
 */
export async function obterUsuarioIdDoToken(
  request: NextRequest
): Promise<string | null> {
  const result = await verificarToken(request);
  return result.valid ? result.usuarioId || null : null;
}
