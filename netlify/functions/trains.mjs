export default async (request) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
    "Cache-Control": "no-store"
  };

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  const url = new URL(request.url);
  const from = (url.searchParams.get("from") || "").trim().toUpperCase();
  const to = (url.searchParams.get("to") || "").trim().toUpperCase();
  const date = (url.searchParams.get("date") || "").trim();

  if (!/^[A-Z0-9]{2,6}$/.test(from) ||
      !/^[A-Z0-9]{2,6}$/.test(to) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return new Response(JSON.stringify({
      error: "Valid from, to station codes and date are required."
    }), { status: 400, headers: corsHeaders });
  }

  const apiKey = Netlify.env.get("QRAIL_API_KEY");
  const endpointTemplate = Netlify.env.get("QRAIL_TRAINS_ENDPOINT");

  if (!apiKey || !endpointTemplate) {
    return new Response(JSON.stringify({
      error: "Train API is not configured yet. Set QRAIL_TRAINS_ENDPOINT in Netlify."
    }), { status: 503, headers: corsHeaders });
  }

  const endpoint = endpointTemplate
    .replaceAll("{from}", encodeURIComponent(from))
    .replaceAll("{to}", encodeURIComponent(to))
    .replaceAll("{date}", encodeURIComponent(date))
    .replaceAll("{apiKey}", encodeURIComponent(apiKey));

  try {
    const response = await fetch(endpoint, {
      headers: { "Accept": "application/json" },
      signal: AbortSignal.timeout(12000)
    });

    const body = await response.text();

    return new Response(body, {
      status: response.status,
      headers: corsHeaders
    });
  } catch {
    return new Response(JSON.stringify({
      error: "Train API could not be reached."
    }), { status: 502, headers: corsHeaders });
  }
};
