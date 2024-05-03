import type { CollectionEntry, ValidContentEntrySlug } from 'astro:content';

export const kinds = ['function', 'type', 'field', 'parameter', 'return', 'constant', 'trait', 'module'] as const;
export type Kind = (typeof kinds)[number];

export type GlossaryEntry = CollectionEntry<'glossary'>;
export type ValidGlossarySlug = ValidContentEntrySlug<'glossary'>;
export type GlossaryRef = { collection: 'glossary'; slug: ValidGlossarySlug };
