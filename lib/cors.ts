/**
 * CORS Validation Module
 * Valida origem das requisições contra lista de domínios permitidos
 */

const getAllowedOrigins = (): string[] => {
  const allowed = process.env.ALLOWED_ORIGINS || 'http://localhost:3000';
  return allowed.split(',').map((origin) => origin.trim());
};

export interface CORSOptions {
  origin: string;
  allowCredentials?: boolean;
  methods?: string[];
  headers?: string[];
  exposedHeaders?: string[];
  maxAge?: number;
}

/**
 * Validar se a origem é permitida
 */
export function isOriginAllowed(origin: string): boolean {
  const allowed = getAllowedOrigins();
  return allowed.includes(origin) || allowed.includes('*');
}

/**
 * Gerar headers CORS para resposta
 */
export function getCORSHeaders(
  origin: string,
  options: Partial<CORSOptions> = {}
): Record<string, string> {
  const isAllowed = isOriginAllowed(origin);

  if (!isAllowed) {
    return {};
  }

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods':
      options.methods || 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers':
      options.headers || 'Content-Type, Authorization',
    'Access-Control-Expose-Headers': options.exposedHeaders || 'X-Total-Count',
    'Access-Control-Max-Age': String(options.maxAge || 86400),
    'Access-Control-Allow-Credentials': String(options.allowCredentials ?? true),
  };
}

/**
 * Validar requisição CORS
 */
export function validateCORS(
  origin: string | undefined,
  method: string,
  options: Partial<CORSOptions> = {}
): {
  isValid: boolean;
  headers: Record<string, string>;
  error?: string;
} {
  if (!origin) {
    return {
      isValid: false,
      headers: {},
      error: 'Origin header is required',
    };
  }

  if (!isOriginAllowed(origin)) {
    return {
      isValid: false,
      headers: {},
      error: `Origin '${origin}' is not allowed`,
    };
  }

  // Validar método se necessário
  const allowedMethods = options.methods || 'GET, POST, PUT, DELETE, PATCH, OPTIONS';
  if (!allowedMethods.includes(method)) {
    return {
      isValid: false,
      headers: getCORSHeaders(origin, options),
      error: `Method '${method}' is not allowed`,
    };
  }

  return {
    isValid: true,
    headers: getCORSHeaders(origin, options),
  };
}

/**
 * Middleware para validar CORS
 * Usar em API routes
 */
export async function validateCORSMiddleware(
  req: Request,
  options: Partial<CORSOptions> = {}
): Promise<{
  isValid: boolean;
  response?: Response;
}> {
  const origin = req.headers.get('origin');
  const method = req.method;

  const validation = validateCORS(origin || '', method, options);

  if (!validation.isValid) {
    return {
      isValid: false,
      response: new Response(
        JSON.stringify({
          error: 'CORS validation failed',
          message: validation.error,
        }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
            ...validation.headers,
          },
        }
      ),
    };
  }

  return {
    isValid: true,
  };
}
