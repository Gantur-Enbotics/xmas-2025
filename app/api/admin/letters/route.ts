import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import XmasUser, { IPicture } from "@/models/xmasUser";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function verifyAdmin(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return false;
  }

  try {
    const token = authHeader.substring(7);
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [username, password] = decoded.split(':');
    
    return username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD;
  } catch {
    return false;
  }
}

function validatePhoneNumber(phone: string): boolean {
  return /^\+976 \d{8}$/.test(phone);
}

function validatePicture(picture: IPicture): { valid: boolean; error?: string } {
  if (!picture.type || !['url', 'uploaded'].includes(picture.type)) {
    return { valid: false, error: 'Invalid picture type' };
  }

  if (!picture.data) {
    return { valid: false, error: 'Picture data is required' };
  }

  if (picture.type === 'url') {
    try {
      new URL(picture.data);
    } catch {
      return { valid: false, error: 'Invalid URL format' };
    }
  }

  if (picture.type === 'uploaded') {
    if (!picture.data.startsWith('data:image/') && !picture.data.startsWith('data:video/')) {
      return { valid: false, error: 'Invalid media format' };
    }

    const base64Length = picture.data.length;
    const sizeInMB = (base64Length * 0.75) / (1024 * 1024);
    if (sizeInMB > 5) {
      return { valid: false, error: 'File size exceeds 5MB limit' };
    }
  }

  return { valid: true };
}

export async function GET(request: NextRequest) {
  try {
    if (!verifyAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const letters = await XmasUser.find({ deleted: false }).sort({ created_at: -1 });

    return NextResponse.json({ success: true, letters });
  } catch (error) {
    console.error('Fetch letters error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!verifyAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { phone, title, context, extra_note, pictures } = body;

    if (!phone || !title || !context) {
      return NextResponse.json(
        { error: 'Phone, title, and context are required' },
        { status: 400 }
      );
    }

    if (!validatePhoneNumber(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Use: +976 XXXXXXXX' },
        { status: 400 }
      );
    }

    if (pictures && Array.isArray(pictures)) {
      for (const picture of pictures) {
        const validation = validatePicture(picture);
        if (!validation.valid) {
          return NextResponse.json({ error: validation.error }, { status: 400 });
        }
      }
    }

    await connectDB();

    const existing = await XmasUser.findOne({ phone, deleted: false });
    if (existing) {
      return NextResponse.json(
        { error: 'A letter already exists for this phone number' },
        { status: 409 }
      );
    }

    const newLetter = await XmasUser.create({
      phone,
      title,
      context,
      extra_note: extra_note || '',
      pictures: pictures || [],
      created_at: new Date(),
      deleted: false,
    });

    return NextResponse.json({ success: true, letter: newLetter }, { status: 201 });
  } catch (error) {
    console.error('Create letter error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!verifyAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { _id, phone, title, context, extra_note, pictures } = body;

    if (!_id) {
      return NextResponse.json({ error: 'Letter ID is required' }, { status: 400 });
    }

    if (phone && !validatePhoneNumber(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Use: +976 XXXXXXXX' },
        { status: 400 }
      );
    }

    if (pictures && Array.isArray(pictures)) {
      for (const picture of pictures) {
        const validation = validatePicture(picture);
        if (!validation.valid) {
          return NextResponse.json({ error: validation.error }, { status: 400 });
        }
      }
    }

    await connectDB();

    const letter = await XmasUser.findById(_id);
    if (!letter || letter.deleted) {
      return NextResponse.json({ error: 'Letter not found' }, { status: 404 });
    }

    if (phone && phone !== letter.phone) {
      const existing = await XmasUser.findOne({ phone, deleted: false, _id: { $ne: _id } });
      if (existing) {
        return NextResponse.json(
          { error: 'Another letter already exists for this phone number' },
          { status: 409 }
        );
      }
    }

    letter.phone = phone || letter.phone;
    letter.title = title || letter.title;
    letter.context = context || letter.context;
    letter.extra_note = extra_note !== undefined ? extra_note : letter.extra_note;
    letter.pictures = pictures !== undefined ? pictures : letter.pictures;

    await letter.save();

    return NextResponse.json({ success: true, letter });
  } catch (error) {
    console.error('Update letter error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!verifyAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Letter ID is required' }, { status: 400 });
    }

    await connectDB();

    const letter = await XmasUser.findById(id);
    if (!letter) {
      return NextResponse.json({ error: 'Letter not found' }, { status: 404 });
    }

    letter.deleted = true;
    await letter.save();

    return NextResponse.json({ success: true, message: 'Letter deleted successfully' });
  } catch (error) {
    console.error('Delete letter error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}