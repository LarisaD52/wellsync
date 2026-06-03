
export function setCookie(name, value, days = 30) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(JSON.stringify(value))}; expires=${expires}; path=/`;
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
  document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
}

export const COOKIE_KEYS = {
  MOOD:       "ws_mood",
  LAST_VISIT: "ws_last_visit",
  USERNAME:   "ws_username",
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