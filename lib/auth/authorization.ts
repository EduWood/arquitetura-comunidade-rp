import { NextRequest, NextResponse } from 'next/server';
import { AuthContext, UserRole } from './types';
import { getAuthContext } from './middleware';

// ========================================
// Authorization Middleware
// ========================================

/**
 * Define role hierarchy
 */
const roleHierarchy: Record<UserRole, number> = {
  SUPER_ADMIN: 3,
  ADMIN: 2,
  MEMBRO: 1,
};

/**
 * Check if user has required role
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (request: NextRequest) => {
    const authContext = getAuthContext(request);

    if (!authContext) {
      return {
        authorized: false,
        user: null,
        error: NextResponse.json(
          { success: false, message: 'Não autorizado' },
          { status: 401 }
        ),
      };
    }

    if (!allowedRoles.includes(authContext.role)) {
      return {
        authorized: false,
        user: authContext,
        error: NextResponse.json(
          { success: false, message: 'Acesso negado' },
          { status: 403 }
        ),
      };
    }

    return {
      authorized: true,
      user: authContext,
      error: null,
    };
  };
}

/**
 * Check if user role is at least the specified level
 */
export function requireRoleLevel(minRole: UserRole) {
  return (request: NextRequest) => {
    const authContext = getAuthContext(request);

    if (!authContext) {
      return {
        authorized: false,
        user: null,
        error: NextResponse.json(
          { success: false, message: 'Não autorizado' },
          { status: 401 }
        ),
      };
    }

    const userLevel = roleHierarchy[authContext.role];
    const requiredLevel = roleHierarchy[minRole];

    if (userLevel < requiredLevel) {
      return {
        authorized: false,
        user: authContext,
        error: NextResponse.json(
          { success: false, message: 'Acesso negado - privilégios insuficientes' },
          { status: 403 }
        ),
      };
    }

    return {
      authorized: true,
      user: authContext,
      error: null,
    };
  };
}

/**
 * Check if user is admin
 */
export function requireAdmin(request: NextRequest) {
  return requireRoleLevel('ADMIN')(request);
}

/**
 * Check if user is super admin
 */
export function requireSuperAdmin(request: NextRequest) {
  return requireRole('SUPER_ADMIN')(request);
}

/**
 * Custom permission checker
 */
export async function checkPermission(
  user: AuthContext,
  permission: string
): Promise<boolean> {
  // TODO: Implement custom permission checking against database
  // For now, based on role hierarchy
  
  const adminPermissions = ['users.manage', 'content.edit', 'cms.edit'];
  const superAdminPermissions = [...adminPermissions, 'system.configure'];

  if (user.role === 'SUPER_ADMIN') {
    return true;
  }

  if (user.role === 'ADMIN' && adminPermissions.includes(permission)) {
    return true;
  }

  return false;
}
