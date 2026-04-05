export async function GET() {
  const upstream = await fetch(
    "https://wvjohfmeubnxlwzgszhe.supabase.co/functions/v1/kenop-signals",
    { cache: "no-store" }
  );
  const html = await upstream.text();
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}
