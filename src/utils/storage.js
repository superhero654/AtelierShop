export function loadFromStorage(key, defaultValue) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore parse errors
  }
  return defaultValue;
}

export function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
