import { NextResponse } from 'next/server';
import { parse } from 'cookie';

export async function GET(request: Request) {
  const cookies = parse(request.headers.get('cookie') || '');
  const { userName, openaiApiKey, userEmail } = cookies;

  return NextResponse.json({ userName, openaiApiKey, userEmail });
}