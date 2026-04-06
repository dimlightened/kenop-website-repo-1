export async function GET() {
  const res = await fetch('https://wvjohfmeubnxlwzgszhe.supabase.co/functions/v1/kenop-success');
  const html = await res.text();
  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }
  });
}
