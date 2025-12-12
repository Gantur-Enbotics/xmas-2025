import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Simple endpoint that redirects to /api/letters/public
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Letters API',
    endpoints: {
      public: '/api/letters/public'
    }
  });
}