import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import XmasUser from '@/models/xmasUser';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET - Fetch all public letter previews (without full content)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const letters = await XmasUser.find({ deleted: false })
      .select('_id title context phone created_at')
      .sort({ created_at: -1 });

    // Return only preview data (first 100 characters of content)
    const previews = letters.map((letter) => ({
      _id: letter._id,
      title: letter.title,
      preview: letter.context.substring(0, 100) + (letter.context.length > 100 ? '...' : ''),
      created_at: letter.created_at,
    }));

    return NextResponse.json({ success: true, letters: previews });
  } catch (error) {
    console.error('Fetch public letters error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}