import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { apiKey } = await req.json();

    if (!apiKey) {
      return NextResponse.json({ valid: false }, { status: 400 });
    }

    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    return NextResponse.json({ valid: response.ok }, { status: 200 });
  } catch (error) {
    console.error('Error validating API key:', error);
    return NextResponse.json({ error: 'Error validating API key' }, { status: 500 });
  }
}