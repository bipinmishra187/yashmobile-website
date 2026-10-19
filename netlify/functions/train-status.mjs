export default async (request) => {
  const cors = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store"
  };

  if (request.method !== "GET") {
    return new Response(
      JSON.stringify({ error: "GET request required" }),
      { status: 405, headers: cors }
    );
  }

  const url = new URL(request.url);
  const trainNumber = url.searchParams.get("trainNumber");
  const date = url.searchParams.get("date") || "today";

  if (!trainNumber || !/^\d{5}$/.test(trainNumber)) {
    return new Response(
      JSON.stringify({ error: "Valid 5-digit train number required" }),
      { status: 400, headers: cors }
    );
  }

  const apiKey = Netlify.env.get("QRAIL_API_KEY");

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "QRAIL_API_KEY is not configured in Netlify" }),
      { status: 500, headers: cors }
    );
  }

  // Configure the exact endpoint from your QRAIL dashboard.
  const template = Netlify.env.get("QRAIL_RUNNING_ENDPOINT");

  if (!template || !template.includes("{trainNumber}") ||
      !template.includes("{date}") || !template.includes("{apiKey}")) {
    return new Response(
      JSON.stringify({
        error: "Configure QRAIL_RUNNING_ENDPOINT using the exact QRAIL URL template"
      }),
      { status: 500, headers: cors }
    );
  }

  const endpoint = template
    .replaceAll("{trainNumber}", encodeURIComponent(trainNumber))
    .replaceAll("{date}", encodeURIComponent(date))
    .replaceAll("{apiKey}", encodeURIComponent(apiKey));

  try {
    const response = await fetch(endpoint, {
      headers: { "Accept": "application/json" },
      signal: AbortSignal.timeout(15000)
    });

    const body = await response.text();

    return new Response(body, {
      status: response.ok ? 200 : 502,
      headers: cors
    });
  } catch {
    return new Response(
      JSON.stringify({ error: "QRAIL service could not be reached" }),
      { status: 502, headers: cors }
    );
  }
};
