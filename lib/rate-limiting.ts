import { Redis } from '@upstash/redis';

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetIn: number; // segundos
  retryAfter?: number; // segundos
}

class RateLimiter {
  private redis: Redis;
  private defaultWindow = 900; // 15 minutos
  private defaultLimit = 5; // 5 tentativas

  constructor() {
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    const url = process.env.UPSTASH_REDIS_REST_URL;

    if (!token || !url) {
      console.warn(
        '[RateLimiter] UPSTASH_REDIS_REST_TOKEN ou UPSTASH_REDIS_REST_URL não configurados. Usando fallback em memória.'
      );
    }

    this.redis = new Redis({
      url: url || 'http://localhost:8079',
      token: token || 'default-token',
    });
  }

  /**
   * Verificar e registrar tentativa
   * @param key - Identificador único (ex: 'login:email@exemplo.com')
   * @param limit - Número máximo de tentativas
   * @param window - Janela de tempo em segundos
   */
  async checkLimit(
    key: string,
    limit: number = this.defaultLimit,
    window: number = this.defaultWindow
  ): Promise<RateLimitResult> {
    try {
      const current = await this.redis.incr(key);

      if (current === 1) {
        // Primeira tentativa, definir expiração
        await this.redis.expire(key, window);
      }

      const ttl = await this.redis.ttl(key);

      if (current > limit) {
        return {
          success: false,
          remaining: 0,
          resetIn: ttl || window,
          retryAfter: ttl || window,
        };
      }

      return {
        success: true,
        remaining: limit - current,
        resetIn: ttl || window,
      };
    } catch (error) {
      console.error('[RateLimiter] Erro ao verificar limite:', error);
      // Fallback: permitir em caso de erro
      return {
        success: true,
        remaining: limit,
        resetIn: window,
      };
    }
  }

  /**
   * Resetar contador
   */
  async reset(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error('[RateLimiter] Erro ao resetar:', error);
    }
  }

  /**
   * Obter contador atual
   */
  async getCount(key: string): Promise<number> {
    try {
      const count = await this.redis.get<number>(key);
      return count || 0;
    } catch (error) {
      console.error('[RateLimiter] Erro ao obter contador:', error);
      return 0;
    }
  }
}

export const rateLimiter = new RateLimiter();

// ========================================
// Funções de conveniência
// ========================================

export async function checkLoginRateLimit(email: string): Promise<RateLimitResult> {
  return rateLimiter.checkLimit(`login:${email}`, 5, 900);
}

export async function checkRegisterRateLimit(email: string): Promise<RateLimitResult> {
  return rateLimiter.checkLimit(`register:${email}`, 3, 3600);
}

export async function checkForgotPasswordRateLimit(email: string): Promise<RateLimitResult> {
  return rateLimiter.checkLimit(`forgot-password:${email}`, 3, 3600);
}

export async function checkResetPasswordRateLimit(token: string): Promise<RateLimitResult> {
  return rateLimiter.checkLimit(`reset-password:${token}`, 5, 900);
}

export async function resetLoginRateLimit(email: string): Promise<void> {
  await rateLimiter.reset(`login:${email}`);
}
