import { JobApplication } from '../types';

// Higher is a better match. The tiers are spaced far enough apart that a
// stronger kind of match always beats a weaker one regardless of which field
// it was found in -- a name starting with the query outranks a name that
// merely contains it, which outranks an email hit.
const TIER = {
  nameExact: 1000,
  namePrefix: 900,
  nameWordPrefix: 800,
  emailPrefix: 700,
  nameContains: 600,
  emailContains: 500,
  none: 0,
} as const;

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * Relevance of one application to a search query, matched against the
 * candidate's name and email only.
 *
 * Returns 0 when nothing matches, which callers use to filter the row out.
 * Location and the LLM fit summary are deliberately excluded: they are long
 * free text, so a one- or two-letter query matched nearly every row through
 * the summary and buried the person actually being looked for.
 */
export function scoreSearchRelevance(app: JobApplication, rawQuery: string): number {
  const query = normalize(rawQuery);
  if (!query) return TIER.nameExact; // No query: everything matches equally.

  const name = normalize(app.candidate.fullName);
  const email = normalize(app.candidate.email);

  if (name === query) return TIER.nameExact;
  if (name.startsWith(query)) return TIER.namePrefix;

  // "sen" should match "Vikram Sen" strongly -- people search by surname as
  // readily as by first name, so any word boundary counts as a prefix hit.
  if (name.split(/\s+/).some((word) => word.startsWith(query))) return TIER.nameWordPrefix;

  if (email.startsWith(query)) return TIER.emailPrefix;
  if (name.includes(query)) return TIER.nameContains;
  if (email.includes(query)) return TIER.emailContains;

  return TIER.none;
}
