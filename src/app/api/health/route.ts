import { NextResponse } from 'next/server';
import { cache } from '@/lib/services/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  const stats = cache.getStats();
  
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    cache: stats,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  };

  return NextResponse.json(health);
}
