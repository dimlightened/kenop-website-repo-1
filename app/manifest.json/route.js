export async function GET() {
  return Response.json({
    name: 'Kenop Intelligence',
    short_name: 'Kenop',
    description: 'Business intelligence that knows your business',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#09090E',
    theme_color: '#EF9F27',
    orientation: 'any',
    lang: 'en-IN',
    categories: ['business', 'finance', 'productivity'],
    icons: [
      { src: 'https://wvjohfmeubnxlwzgszhe.supabase.co/functions/v1/kenop-icon?size=192', sizes: '192x192', type: 'image/svg+xml', purpose: 'any maskable' },
      { src: 'https://wvjohfmeubnxlwzgszhe.supabase.co/functions/v1/kenop-icon?size=512', sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' }
    ],
    shortcuts: [
      { name: 'Request Demo', url: '/demo', description: 'Request a Kenop demo' },
      { name: 'Pricing', url: '/pricing', description: 'View pricing plans' }
    ]
  }, { headers: { 'Content-Type': 'application/manifest+json', 'Cache-Control': 'public, max-age=86400' } });
}
