import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import XmasUser from '@/models/xmasUser';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET - Fetch all public letter previews (without full content)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

   const letters = await XmasUser.find({ deleted: false }).select('-__v').sort({ created_at: -1 });

    const previews = letters.map((letter) => ({
      _id: letter._id,
      title: letter.title,
      context: letter.context,
      extra_note: letter.extra_note,
      loggedAt: letter.loggedAt,
      phone: letter.phone,
      pictures: letter.pictures,
      created_at: letter.created_at,
    }));

    return NextResponse.json({ success: true, letters: previews });
  } catch (error) {
    console.error('Fetch public letters error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}