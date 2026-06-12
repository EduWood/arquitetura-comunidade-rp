// CMS Middleware - Middleware centralizado para autenticação e auditoria CMS

import { NextRequest, NextResponse } from 'next/server';
import { verificarToken } from '@/lib/auth/token-verification';
import { ehAdmin } from '@/lib/auth/permission-checker';
import { auditLog } from '@/lib/audit-logger';

export interface CMSMiddlewareResult {
  valid: boolean;
  usuarioId?: string;
  error?: string;
  response?: NextResponse;
}

/**
 * Middleware de autenticação obrigatória para CMS
 */
export async function verificarAutenticacaoCMS(
  request: NextRequest
): Promise<CMSMiddlewareResult> {
  try {
    const tokenResult = await verificarToken(request);

    if (!tokenResult.valid) {
      const response = NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
      return {
        valid: false,
        error: 'Não autenticado',
        response,
      };
    }

    return {
      valid: true,
      usuarioId: tokenResult.usuarioId,
    };
  } catch (error) {
    console.error('[verificarAutenticacaoCMS] Erro:', error);
    return {
      valid: false,
      error: 'Erro de autenticação',
      response: NextResponse.json(
        { error: 'Erro de autenticação' },
        { status: 500 }
      ),
    };
  }
}

/**
 * Middleware verificando se é ADMIN
 */
export async function verificarAdminCMS(
  request: NextRequest
): Promise<CMSMiddlewareResult> {
  try {
    const auth = await verificarAutenticacaoCMS(request);

    if (!auth.valid || !auth.usuarioId) {
      return auth;
    }

    const isAdmin = await ehAdmin(auth.usuarioId);

    if (!isAdmin) {
      const response = NextResponse.json(
        { error: 'Sem permissão para acessar CMS' },
        { status: 403 }
      );

      // Log de tentativa não autorizada
      await auditLog({
        usuario_id: auth.usuarioId,
        acao: 'CMS_ACESSO_NEGADO',
        tabela_afetada: 'CMSSeccao',
        valores_depois: {
          motivo: 'Sem permissão ADMIN',
          endpoint: request.nextUrl.pathname,
        },
      });

      return {
        valid: false,
        error: 'Sem permissão ADMIN',
        response,
      };
    }

    return {
      valid: true,
      usuarioId: auth.usuarioId,
    };
  } catch (error) {
    console.error('[verificarAdminCMS] Erro:', error);
    return {
      valid: false,
      error: 'Erro ao verificar permissões',
      response: NextResponse.json(
        { error: 'Erro ao verificar permissões' },
        { status: 500 }
      ),
    };
  }
}

/**
 * Log de acesso CMS
 */
export async function logAcessoCMS(
  usuarioId: string,
  acao: string,
  detalhes?: Record<string, any>
) {
  try {
    await auditLog({
      usuario_id: usuarioId,
      acao: `CMS_${acao}`,
      tabela_afetada: 'CMSSeccao',
      valores_depois: detalhes,
    });
  } catch (error) {
    console.error('[logAcessoCMS] Erro:', error);
  }
}
