import { NextResponse } from 'next/server';
import { metrics } from '@/lib/monitoring';
import { logger } from '@/lib/logger';
import { config } from '@/lib/env';

export async function GET() {
  const startTime = Date.now();
  
  try {
    // Get system health status
    const healthStatus = metrics.getHealthStatus();
    const responseTime = Date.now() - startTime;
    
    // Additional health checks
    const checks = {
      database: 'healthy', // In a real app, you'd check database connectivity
      externalApis: 'healthy', // Check Binance/CoinGecko API availability
      memory: process.memoryUsage(),
      uptime: process.uptime(),
    };
    
    const health = {
      status: healthStatus.status,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: config.isDevelopment ? 'development' : 'production',
      responseTime,
      metrics: healthStatus.metrics,
      issues: healthStatus.issues,
      checks,
    };
    
    logger.info('Health check completed', { 
      status: healthStatus.status,
      responseTime,
      issues: healthStatus.issues.length 
    });
    
    const statusCode = healthStatus.status === 'healthy' ? 200 : 
                      healthStatus.status === 'degraded' ? 200 : 503;
    
    return NextResponse.json(health, {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
    });
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    logger.error('Health check failed', { responseTime }, error as Error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      responseTime,
    }, {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
    });
  }
}
