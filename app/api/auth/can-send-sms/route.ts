import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import XmasUser from '@/models/xmasUser';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const COOLDOWN_MS = 2 * 24 * 60 * 60 * 1000; // 2 days

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await XmasUser.findOne({ phone, deleted: false });

    if (!user) {
      return NextResponse.json(
        { error: 'No letter found for this phone number' },
        { status: 404 }
      );
    }

    const canResend =
      !user.loggedAt ||
      Date.now() - new Date(user.loggedAt).getTime() > COOLDOWN_MS;

    return NextResponse.json({
      success: true,
      canResend,
      lastSentAt: user.loggedAt ?? null,
    });
  } catch (err) {
    console.error('can-send-sms error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
