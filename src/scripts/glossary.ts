import type { CollectionEntry } from 'astro:content';

export const kinds = ['function', 'type', 'field', 'trait', 'module'] as const;
export type Kind = (typeof kinds)[number];

export type GlossaryEntry = CollectionEntry<'glossary'>;
