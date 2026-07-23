// Cloudflare Pages Function - /api/search (DDG Lite Search & Webpage Reader)
export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const query = url.searchParams.get("q");
  const readUrl = url.searchParams.get("read");

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "*"
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // 1. Webpage Content Reader
  if (readUrl) {
    try {
      const res = await fetch(readUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const text = await res.text();
      const clean = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
                        .replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      return new Response(clean.substring(0, 15000), { 
        headers: { ...corsHeaders, "Content-Type": "text/plain;charset=utf-8" } 
      });
    } catch(e) {
      return new Response("Read Error: " + e.message, { headers: corsHeaders });
    }
  }

  // 2. Anti-blocking DuckDuckGo Lite Search Engine
  let searchQ = query;
  if (!searchQ && request.method === 'POST') {
    try {
      const body = await request.json();
      searchQ = body.query || body.q;
    } catch(e) {}
  }

  if (!searchQ) {
    return new Response("Missing parameters", { headers: corsHeaders, status: 400 });
  }

  try {
    const ddgUrl = 'https://lite.duckduckgo.com/lite/';
    const response = await fetch(ddgUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: 'q=' + encodeURIComponent(searchQ)
    });

    const html = await response.text();
    const results = [];
    
    const parts = html.split('<td valign="top">');
    for (let i = 1; i < parts.length; i++) {
       const part = parts[i];
       const linkMatch = part.match(/href="([^"]+)" class='result-link'>([\s\S]*?)<\/a>/);
       const snippetMatch = part.match(/<td class='result-snippet'>([\s\S]*?)<\/td>/);
       if (linkMatch && snippetMatch) {
           const link = linkMatch[1];
           const title = linkMatch[2].replace(/<[^>]+>/g, '').trim();
           const snippet = snippetMatch[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
           results.push(`标题: ${title}\n链接: ${link}\n摘要: ${snippet}\n`);
       }
    }

    const finalText = results.slice(0, 6).join('\n') || "未找到相关搜索结果。";

    return new Response(finalText, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/plain;charset=utf-8"
      }
    });
  } catch (err) {
    return new Response(err.message, { headers: corsHeaders, status: 500 });
  }
}
