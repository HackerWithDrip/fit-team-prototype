// Global configuration for frontend
// Centralized API base URL so we don't repeat logic everywhere

// Prefer environment variable when provided (e.g. in GitHub Actions)
// Fallback:
// - Localhost when running on localhost
// - Railway backend when running in production (GitHub Pages)
export const API_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:3001/api'
    : 'https://fit-team-prototype-production.up.railway.app/api');


