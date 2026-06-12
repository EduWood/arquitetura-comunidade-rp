// Permission Checker - Verifica permissões de usuário

import { prisma } from '@/lib/db';

export async function verificarPermissao(
  usuarioId: string,
  roleRequerida: 'ADMIN' | 'EDITOR' | 'USER'
): Promise<boolean> {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { role: true },
    });

    if (!usuario) {
      return false;
    }

    // Hierarquia de roles
    const hierarquia = {
      USER: 0,
      EDITOR: 1,
      ADMIN: 2,
    };

    const usuarioLevel = hierarquia[usuario.role as keyof typeof hierarquia] ?? 0;
    const requeridoLevel = hierarquia[roleRequerida];

    return usuarioLevel >= requeridoLevel;
  } catch (error) {
    console.error('[verificarPermissao] Erro:', error);
    return false;
  }
}

/**
 * Verificar se usuário é ADMIN
 */
export async function ehAdmin(usuarioId: string): Promise<boolean> {
  return verificarPermissao(usuarioId, 'ADMIN');
}

/**
 * Verificar se usuário é EDITOR ou ADMIN
 */
export async function ehEditor(usuarioId: string): Promise<boolean> {
  return verificarPermissao(usuarioId, 'EDITOR');
}

/**
 * Verificar se usuário pode acessar recurso específico
 */
export async function podeAcessarRecurso(
  usuarioId: string,
  recurso: string
): Promise<boolean> {
  try {
    // Para CMS, apenas ADMIN pode acessar
    if (recurso.startsWith('cms:')) {
      return ehAdmin(usuarioId);
    }

    // Para outros recursos, verificar permissões específicas
    // Implementar lógica conforme necessário

    return true;
  } catch (error) {
    console.error('[podeAcessarRecurso] Erro:', error);
    return false;
  }
}
