/**
 * Generate academic session options dynamically.
 * From August onward, the upcoming session (e.g. 2026/2027) becomes available.
 */
export function getAcademicSessionOptions(count = 3) {
  const now = new Date();
  const year = now.getFullYear();
  // Academic sessions typically start in August/September.
  // From August onward, the new session is the current one.
  const startYear = now.getMonth() >= 7 ? year : year - 1;

  return Array.from({ length: count }, (_, i) => {
    const y = startYear - i;
    const session = `${y}/${y + 1}`;
    return { value: session, label: session };
  });
}
