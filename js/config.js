/*
 * config.js — BACKEND CONNECTION SETTINGS
 *
 * After deploying the backend to Railway or Render,
 * paste your backend URL into API_BASE below.
 *
 * Example:
 *   const API_BASE = 'http[path]';
 *
 * Leave it as '' when running on TAPI platform.
 * ⚠ No trailing slash.
 */

const API_BASE = 'https://web-production-7f1ce.up.railway.app';

function apiUrl(path) {
  if (API_BASE) {
    return API_BASE + path;
  }
  return '/api/deborasaurusrex' + path;
}
