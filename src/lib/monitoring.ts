// Production monitoring and metrics
import { logger } from './logger';

export interface Metrics {
  apiRequests: number;
  apiErrors: number;
  cacheHits: number;
  cacheMisses: number;
  responseTime: number;
}

class MetricsCollector {
  private metrics: Metrics = {
    apiRequests: 0,
    apiErrors: 0,
    cacheHits: 0,
    cacheMisses: 0,
    responseTime: 0,
  };

  private responseTimes: number[] = [];

  // API Metrics
  recordApiRequest(): void {
    this.metrics.apiRequests++;
    logger.debug('API request recorded', { totalRequests: this.metrics.apiRequests });
  }

  recordApiError(error: Error): void {
    this.metrics.apiErrors++;
    logger.error('API error recorded', { 
      totalErrors: this.metrics.apiErrors,
      errorRate: this.getErrorRate()
    }, error);
  }

  recordResponseTime(time: number): void {
    this.responseTimes.push(time);
    this.metrics.responseTime = this.calculateAverageResponseTime();
    
    // Keep only last 100 response times for memory efficiency
    if (this.responseTimes.length > 100) {
      this.responseTimes = this.responseTimes.slice(-100);
    }
  }


  // Cache Metrics
  recordCacheHit(): void {
    this.metrics.cacheHits++;
    logger.debug('Cache hit recorded', { 
      hitRate: this.getCacheHitRate() 
    });
  }

  recordCacheMiss(): void {
    this.metrics.cacheMisses++;
    logger.debug('Cache miss recorded', { 
      hitRate: this.getCacheHitRate() 
    });
  }

  // Utility Methods
  private calculateAverageResponseTime(): number {
    if (this.responseTimes.length === 0) return 0;
    return this.responseTimes.reduce((sum, time) => sum + time, 0) / this.responseTimes.length;
  }

  private getErrorRate(): number {
    if (this.metrics.apiRequests === 0) return 0;
    return (this.metrics.apiErrors / this.metrics.apiRequests) * 100;
  }

  private getCacheHitRate(): number {
    const total = this.metrics.cacheHits + this.metrics.cacheMisses;
    if (total === 0) return 0;
    return (this.metrics.cacheHits / total) * 100;
  }

  // Get current metrics
  getMetrics(): Metrics & { 
    errorRate: number; 
    cacheHitRate: number; 
    averageResponseTime: number;
  } {
    return {
      ...this.metrics,
      errorRate: this.getErrorRate(),
      cacheHitRate: this.getCacheHitRate(),
      averageResponseTime: this.calculateAverageResponseTime(),
    };
  }

  // Reset metrics (useful for testing or periodic resets)
  reset(): void {
    this.metrics = {
      apiRequests: 0,
      apiErrors: 0,
      cacheHits: 0,
      cacheMisses: 0,
      responseTime: 0,
    };
    this.responseTimes = [];
    logger.info('Metrics reset');
  }

  // Health check
  getHealthStatus(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    metrics: ReturnType<MetricsCollector['getMetrics']>;
    issues: string[];
  } {
    const metrics = this.getMetrics();
    const issues: string[] = [];

    // Check error rate
    if (metrics.errorRate > 10) {
      issues.push(`High error rate: ${metrics.errorRate.toFixed(2)}%`);
    }

    // Check response time
    if (metrics.averageResponseTime > 2000) {
      issues.push(`Slow response time: ${metrics.averageResponseTime.toFixed(2)}ms`);
    }

    // Check cache hit rate
    if (metrics.cacheHitRate < 50 && metrics.cacheHits + metrics.cacheMisses > 10) {
      issues.push(`Low cache hit rate: ${metrics.cacheHitRate.toFixed(2)}%`);
    }

    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (issues.length === 0) {
      status = 'healthy';
    } else if (issues.length <= 2) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }

    return { status, metrics, issues };
  }
}

// Export singleton instance
export const metrics = new MetricsCollector();

// Performance monitoring decorator
export function withPerformanceMonitoring<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  name: string
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    const startTime = Date.now();
    metrics.recordApiRequest();
    
    try {
      const result = await fn(...args);
      const responseTime = Date.now() - startTime;
      metrics.recordResponseTime(responseTime);
      
      logger.debug(`Performance monitoring: ${name}`, {
        responseTime,
        success: true,
      });
      
      return result;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      metrics.recordResponseTime(responseTime);
      metrics.recordApiError(error as Error);
      
      logger.error(`Performance monitoring: ${name}`, {
        responseTime,
        success: false,
      }, error as Error);
      
      throw error;
    }
  };
}
