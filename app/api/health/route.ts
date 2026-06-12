import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  database: 'connected' | 'disconnected';
  checks: {
    api: boolean;
    database: boolean;
    cache: boolean;
  };
  version: string;
  environment: string;
}

export async function GET() {
  const startTime = Date.now();
  const healthStatus: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: 'disconnected',
    checks: {
      api: true,
      database: false,
      cache: true,
    },
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'production',
  };

  try {
    // Check database connection
    const dbCheck = await prisma.$queryRaw`SELECT 1`;
    if (dbCheck) {
      healthStatus.database = 'connected';
      healthStatus.checks.database = true;
    }
  } catch (error) {
    console.error('[Health Check] Database error:', error);
    healthStatus.checks.database = false;
    healthStatus.database = 'disconnected';
    healthStatus.status = 'degraded';
  }

  // Calculate response time
  const responseTime = Date.now() - startTime;

  // Determine overall status
  if (!healthStatus.checks.database) {
    healthStatus.status = 'unhealthy';
  } else if (responseTime > 5000) {
    healthStatus.status = 'degraded';
  }

  const statusCode = healthStatus.status === 'healthy' ? 200 : 503;

  return NextResponse.json(
    {
      ...healthStatus,
      responseTime: `${responseTime}ms`,
    },
    { status: statusCode }
  );
}
