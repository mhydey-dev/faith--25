export function splitLetterParagraphs(body: string): string[] {
  return body
    .trim()
    .split(/\n+/)
    .map((part) => part.trim())
    .filter(Boolean);
}
