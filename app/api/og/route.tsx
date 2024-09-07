import { ImageResponse } from 'next/og';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 40,
          color: 'black',
          background: 'white',
          width: '100%',
          height: '100%',
          padding: '50px 200px',
          textAlign: 'center',
          justifyContent: 'center',
          alignItems: 'center',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <svg
            width="100"
            height="100"
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ marginRight: '30px' }}
          >
            <defs>
              <linearGradient id="briefcaseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8EC5FC" />
                <stop offset="50%" stopColor="#3675f1" />
                <stop offset="100%" stopColor="#2556e4" />
              </linearGradient>
            </defs>
            <rect width="20" height="14" x="2" y="7" rx="2" ry="2" stroke="url(#briefcaseGradient)" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" stroke="url(#briefcaseGradient)" />
          </svg>
          <div style={{ fontFamily: 'Avenir, sans-serif', fontSize: '80px', fontWeight: 'bold'  }}>
            Briefcase
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}