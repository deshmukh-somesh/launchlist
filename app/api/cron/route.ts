import { db } from '@/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Check authorization
    const authHeader = request.headers.get('authorization');
    if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const now = new Date();
    
    // Update launch status
    const result = await db.product.updateMany({
      where: {
        launchDate: { lte: now },
        isLaunched: true,
        launchStarted: false
      },
      data: {
        launchStarted: true
      }
    });

    console.log(`[CRON] Updated ${result.count} products to launched status at ${now.toISOString()}`);

    return NextResponse.json({ 
      success: true, 
      message: `Updated ${result.count} products`,
      timestamp: now.toISOString(),
      updatedCount: result.count 
    });
  } catch (error) {
    console.error('[CRON] Failed to update launch status:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update launch status' 
    }, { status: 500 });
  }
} 