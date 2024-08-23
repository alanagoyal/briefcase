import { NextResponse } from 'next/server';
import { Sdk } from '@actionbase/web-action-sdk';

export async function POST(request: Request) {
  console.log('Received LinkedIn connection request');
  try {
    const sdk = new Sdk(process.env.ACTIONBASE_API_KEY!);
    const body = await request.json();
    const { to } = body;

    console.log('Request body:', body);

    if (!to) {
      console.warn('Missing "to" parameter in request');
      return NextResponse.json({ success: false, error: 'Missing "to" parameter' }, { status: 400 });
    }

    console.log(`Sending connection request to: ${to}`);

    const results = await sdk.linkedin.sendConnectionRequest({
      to: to,
      note: "Hello from the Web Action SDK!"
    });

    console.log('Connection request sent successfully:', results);

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Error sending LinkedIn connection request:', error);
    return NextResponse.json({ success: false, error: 'Failed to send connection request' }, { status: 500 });
  }
}