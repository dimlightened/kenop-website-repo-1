export async function GET() {
  const upstream = await fetch(
    "https://wvjohfmeubnxlwzgszhe.supabase.co/functions/v1/demo-page",
    { cache: "no-store" }
  );
  const html = await upstream.text();
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
