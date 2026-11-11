const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("sweety_token");

  const headers = { ...options.headers };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Let the body set its own content-type when it is FormData or similar
  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  } catch {
    throw new Error("Network error. Please check your connection and try again.");
  }

  // 204 No Content ? nothing to parse
  if (response.status === 204) {
    return null;
  }

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const err = new Error(body.error ?? `HTTP ${response.status}`);
    err.status = response.status;
    throw err;
  }

  return body;
}
