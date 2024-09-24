import { NextResponse } from 'next/server';
import { serialize } from 'cookie';

export async function POST(request: Request) {
  const { userName, openaiApiKey, userEmail } = await request.json();

  const response = NextResponse.json({ message: 'User info set' });

  response.headers.append('Set-Cookie', serialize('userName', userName, { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/' }));
  response.headers.append('Set-Cookie', serialize('openaiApiKey', openaiApiKey, { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/' }));
  response.headers.append('Set-Cookie', serialize('userEmail', userEmail, { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/' }));

  return response;
}