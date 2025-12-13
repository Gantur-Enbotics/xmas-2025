import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import XmasUser from '@/models/xmasUser';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

    user.loggedAt = new Date();
    await user.save();

    return NextResponse.json({
      success: true,
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
  } catch (err) {
    console.error('mark-verified error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
