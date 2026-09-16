import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const raw = readFileSync(join(process.cwd(), 'income', 'wayl', 'items.json'), 'utf-8');
    const data = JSON.parse(raw);
    return NextResponse.json(data);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
