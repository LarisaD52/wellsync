// src/utils/cookies.js
// Silver Challenge: user activity & preference monitoring via cookies

const COOKIE_DEFAULTS = { path: "/", maxAge: 60 * 60 * 24 * 30 }; // 30 days

function serialize(name, value, opts = {}) {
  const options = { ...COOKIE_DEFAULTS, ...opts };
  let str = `${encodeURIComponent(name)}=${encodeURIComponent(JSON.stringify(value))}`;
  if (options.maxAge) str += `; max-age=${options.maxAge}`;
  if (options.path)   str += `; path=${options.path}`;
  return str;
}

export function setCookie(name, value, opts = {}) {
  document.cookie = serialize(name, value, opts);
}

export function getCookie(name) {
  const key = encodeURIComponent(name) + "=";
  const found = document.cookie.split(";").map(c => c.trim()).find(c => c.startsWith(key));
  if (!found) return null;
  try {
    return JSON.parse(decodeURIComponent(found.slice(key.length)));
  } catch {
    return null;
  }
}

export function deleteCookie(name) {
  document.cookie = serialize(name, "", { maxAge: 0 });
}

// ─── App-specific helpers ────────────────────────────────────────────────────

export const COOKIE_KEYS = {
  MOOD:         "ws_mood",
  LAST_VISIT:   "ws_last_visit",
  USERNAME:     "ws_username",
};

export function saveMood(mood) {
  setCookie(COOKIE_KEYS.MOOD, { value: mood, timestamp: Date.now() });
}

export function loadMood() {
  return getCookie(COOKIE_KEYS.MOOD);
}

export function saveLastVisit(page) {
  setCookie(COOKIE_KEYS.LAST_VISIT, { page, timestamp: Date.now() });
}

export function saveUsername(name) {
  setCookie(COOKIE_KEYS.USERNAME, name);
}

export function loadUsername() {
  return getCookie(COOKIE_KEYS.USERNAME);
}