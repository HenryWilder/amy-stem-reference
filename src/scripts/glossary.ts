import { getCollection, getEntry, type CollectionEntry, type ValidContentEntrySlug } from 'astro:content';

export const kinds = ['function', 'type', 'field', 'parameter', 'return', 'constant', 'trait', 'module'] as const;
export type Kind = (typeof kinds)[number];

export type GlossarySlug = ValidContentEntrySlug<'glossary'>;

export type ChildOfGlossarySlug<Parent extends GlossarySlug> = Exclude<
    Extract<GlossarySlug, `${Parent}/${string}`>,
    Extract<GlossarySlug, `${Parent}/${string}/${string}`>
>;

export type GlossaryEntry = CollectionEntry<'glossary'>;

export type GlossaryEntryOfKind<K extends Kind> = GlossaryEntry & { data: { kind: K } };

export type ChildOfGlossaryEntry<Parent extends GlossarySlug> = GlossaryEntry & { slug: ChildOfGlossarySlug<Parent> };

export type GlossaryRef = { collection: 'glossary'; slug: GlossarySlug };
export type ChildOfGlossaryRef<Parent extends GlossarySlug> = GlossaryRef & { slug: ChildOfGlossarySlug<Parent> };

export const isEntryOfKind = <K extends Kind>(kind: K, entry: GlossaryEntry): entry is GlossaryEntryOfKind<K> => {
    return entry.data.kind === kind;
};

export const isChildOf = <P extends GlossarySlug>(parent: P, child: GlossarySlug): child is ChildOfGlossarySlug<P> => {
    return child.startsWith(parent + '/') && !child.slice(parent.length).includes('/');
};

export const getChildren = async <P extends GlossarySlug>(parent: P, filter?: (entry: GlossaryEntry) => boolean) => {
    return (await getCollection('glossary', (entry: GlossaryEntry) => isChildOf(parent, entry.slug) && (filter?.(entry) ?? true))) as ChildOfGlossaryEntry<P>[];
};

export const getChildrenOfKind = async <K extends Kind>(parent: GlossarySlug, kind: K, filter?: (entry: GlossaryEntry) => boolean) => {
    return (await getChildren(parent, (entry: GlossaryEntry) => isEntryOfKind(kind, entry) && (filter?.(entry) ?? true))) as GlossaryEntryOfKind<K>[];
};

export const getParent = async (item: GlossaryEntry): Promise<GlossaryEntry | undefined> => {
    const parentSlug = item.slug.slice(0, item.slug.lastIndexOf('/')) as GlossarySlug;
    console.log(parentSlug);
    return parentSlug.length !== 0 ? await getEntry('glossary', parentSlug) : undefined;
};
