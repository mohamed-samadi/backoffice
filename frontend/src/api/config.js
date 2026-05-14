// API Configuration
// URL is injected by docker/entrypoint.sh at container startup

export function getApiUrl() {
  if (import.meta.env.DEV) {
    return "http://localhost:8000";
  }

  if (typeof window !== "undefined" && window.__VITE_API_URL__) {
    return window.__VITE_API_URL__;
  }

  return "/api";
}

export function buildApiUrl(endpoint) {
  const baseUrl = getApiUrl();
  const path = endpoint.startsWith("/") ? endpoint : "/" + endpoint;
  return baseUrl + path;
}

export async function fetchApi(endpoint, options = {}) {
  const url = buildApiUrl(endpoint);

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(
      "API Error: " + response.status + " " + response.statusText,
    );
  }

  return response.json();
}
