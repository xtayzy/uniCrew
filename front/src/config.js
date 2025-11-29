// Конфигурация API URL
const normalizeUrl = (url) => (url.endsWith("/") ? url : `${url}/`);

export const API_URL = (() => {
  if (import.meta.env.VITE_API_URL) {
    return normalizeUrl(import.meta.env.VITE_API_URL);
  }

  if (typeof window !== "undefined") {
    return normalizeUrl(`${window.location.origin}/api/`);
  }

  return "http://127.0.0.1:8000/api/";
})();

