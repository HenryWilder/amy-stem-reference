import { getCollection, getEntry, type CollectionEntry, type ValidContentEntrySlug } from 'astro:content';

export const kinds = ['function', 'type', 'field', 'parameter', 'return', 'constant', 'trait', 'module'] as const;
export type Kind = (typeof kinds)[number];

export type GlossaryEntry = CollectionEntry<'glossary'>;
export type ValidGlossarySlug = ValidContentEntrySlug<'glossary'>;
export type GlossaryRef = { collection: 'glossary'; slug: ValidGlossarySlug };

export const getChildren = async (parent: ValidGlossarySlug, filter?: (entry: GlossaryEntry) => boolean): Promise<GlossaryEntry[]> => {
    const parentPath = parent.split('/');
    return await getCollection('glossary', (entry: GlossaryEntry) => {
        const path = entry.slug.split('/');
        const isChild = path.length === parentPath.length + 1 && path.slice(0, -1).every((part, index) => part === parentPath[index]);
        return isChild && (!filter || filter(entry));
    });
};

export const getParent = async (item: GlossaryEntry): Promise<GlossaryEntry | undefined> => {
    const parentSlug = item.slug.split('/').slice(0, -1).join('/');
    return parentSlug.length !== 0 ? await getEntry('glossary', parentSlug as ValidGlossarySlug) : undefined;
};
