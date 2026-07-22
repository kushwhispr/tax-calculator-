const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8787';

export async function lookupProperty({ county, address, zip }) {
  const params = new URLSearchParams({ county, address, zip });
  const res = await fetch(`${BACKEND_URL}/api/lookup?${params.toString()}`);
  const body = await res.json();
  if (!res.ok) {
    const err = new Error(body.message || 'Lookup failed');
    err.code = body.code;
    throw err;
  }
  return body;
}
