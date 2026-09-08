export const UNLOCK_PW_KEY = "faith-25-letter-pw";

export function splitLetterParagraphs(body: string): string[] {
  return body
    .trim()
    .split(/\n+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function readStoredLetterPassword(): string {
  if (typeof window === "undefined") return "";
  try {
    return sessionStorage.getItem(UNLOCK_PW_KEY) || "";
  } catch {
    return "";
  }
}

export function storeLetterPassword(password: string) {
  try {
    sessionStorage.setItem(UNLOCK_PW_KEY, password);
  } catch {
    /* ignore */
  }
}

export function clearStoredLetterPassword() {
  try {
    sessionStorage.removeItem(UNLOCK_PW_KEY);
  } catch {
    /* ignore */
  }
}
