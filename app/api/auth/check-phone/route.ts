import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import XmasUser from '@/models/xmasUser';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    await connectDB();

    const user = await XmasUser.findOne({ phone, deleted: false });

    if (!user) {
      return NextResponse.json({ error: 'No letter found for this phone number' }, { status: 404 });
    }

    // Check if user can resend verification (2 days cooldown)
    const canResend = !user.loggedAt || 
      (Date.now() - new Date(user.loggedAt).getTime()) > 2 * 24 * 60 * 60 * 1000;

    // Update loggedAt timestamp
    user.loggedAt = new Date();
    await user.save();

    return NextResponse.json({
      success: true,
      canResend,
      user: {
        _id: user._id,
        phone: user.phone,
        title: user.title,
        context: user.context,
        extra_note: user.extra_note,
        pictures: user.pictures,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}