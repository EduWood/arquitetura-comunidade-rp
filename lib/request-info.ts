// Request Information Extractor - Obtém IP e User-Agent de forma confiável

import { NextRequest } from 'next/server';

export interface RequestInfo {
  ip: string;
  userAgent: string;
  userAgentParsed?: {
    browser?: string;
    os?: string;
    device?: string;
  };
}

export function extractRequestInfo(request: NextRequest): RequestInfo {
  // Extrair IP com prioridade:
  // 1. x-forwarded-for (proxy reverso)
  // 2. x-real-ip (nginx)
  // 3. cf-connecting-ip (Cloudflare)
  // 4. socket.remoteAddress fallback
  const ip =
    (request.headers.get('x-forwarded-for')?.split(',')[0].trim()) ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    (request as any).ip ||
    'unknown';

  // Extrair User-Agent
  const userAgent = request.headers.get('user-agent') || 'unknown';

  // Parse User-Agent (simples)
  const userAgentParsed = parseUserAgent(userAgent);

  return {
    ip: ip.substring(0, 50), // Limitar tamanho para banco
    userAgent: userAgent.substring(0, 500), // Limitar tamanho
    userAgentParsed,
  };
}

/**
 * Parse simples de User-Agent
 */
function parseUserAgent(
  ua: string
): RequestInfo['userAgentParsed'] {
  const browsers: Record<string, string> = {
    Chrome: 'Chrome',
    Firefox: 'Firefox',
    Safari: 'Safari',
    'Edge': 'Edge',
    Opera: 'Opera',
  };

  const oses: Record<string, string> = {
    'Windows NT': 'Windows',
    Macintosh: 'macOS',
    Linux: 'Linux',
    'Android': 'Android',
    'iPhone|iPad': 'iOS',
  };

  let browser = 'Unknown';
  let os = 'Unknown';
  let device = 'Desktop';

  // Detectar navegador
  for (const [key, value] of Object.entries(browsers)) {
    if (ua.includes(key)) {
      browser = value;
      break;
    }
  }

  // Detectar SO
  for (const [key, value] of Object.entries(oses)) {
    if (ua.includes(key)) {
      os = value;
      break;
    }
  }

  // Detectar dispositivo
  if (ua.includes('Mobile') || ua.includes('Android')) {
    device = 'Mobile';
  } else if (ua.includes('Tablet') || ua.includes('iPad')) {
    device = 'Tablet';
  }

  return {
    browser,
    os,
    device,
  };
}
