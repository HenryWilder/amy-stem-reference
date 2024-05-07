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

export type ChildOfGlossaryEntry<Parent extends GlossarySlug> = Extract<GlossaryEntry, { slug: ChildOfGlossarySlug<Parent> }>;

export type GlossaryRef = { collection: 'glossary'; slug: GlossarySlug };
export type ChildOfGlossaryRef<Parent extends GlossarySlug> = Extract<GlossaryRef, { slug: ChildOfGlossarySlug<Parent> }>;

export const isEntryOfKind = <K extends Kind>(kind: K, entry: GlossaryEntry): entry is GlossaryEntryOfKind<K> => {
    return entry.data.kind === kind;
};

export const isChildOf = <P extends GlossarySlug>(parent: P, child: GlossarySlug): child is ChildOfGlossarySlug<P> => {
    return child.startsWith(parent + '/') && !child.slice(parent.length + 1).includes('/');
};

export const getChildren = async <P extends GlossarySlug>(parent: P, filter?: (entry: GlossaryEntry) => boolean) => {
    return (await getCollection('glossary', (entry: GlossaryEntry) => {
        const isChild = isChildOf(parent, entry.slug) && (!filter || filter(entry));
        // console.log(`${entry.slug} ${isChild ? 'is' : 'is not'} a child of ${parent}`);
        return isChild;
    })) as ChildOfGlossaryEntry<P>[];
};

export const getChildrenOfKind = async <K extends Kind>(parent: GlossarySlug, kind: K, filter?: (entry: GlossaryEntry) => boolean) => {
    return (await getChildren(parent, (entry: GlossaryEntry) => isEntryOfKind(kind, entry) && (!filter || filter(entry)))) as GlossaryEntryOfKind<K>[];
};

export const getParent = async (item: GlossaryEntry): Promise<GlossaryEntry | undefined> => {
    const parentSlug = item.slug.slice(0, item.slug.lastIndexOf('/') + 1) as GlossarySlug;
    // console.log(parentSlug);
    return parentSlug.length !== 0 ? await getEntry('glossary', parentSlug) : undefined;
};

// ---

export interface GlossaryTreeNode {
    item: GlossaryEntry;
    childrenByKind: [Kind, GlossaryTreeNode[]][];
}

const getChildrenRecursively = async (root: GlossaryEntry): Promise<GlossaryTreeNode> => {
    const item: GlossaryEntry = root;

    const immediateChildrenByKind: [Kind, GlossaryEntry[]][] = await Promise.all(
        kinds.map(async (kind) => {
            const childItems: GlossaryEntry[] = await getChildrenOfKind(item.slug, kind);
            return [kind, childItems];
        })
    );

    const whereExisting: [Kind, GlossaryEntry[]][] = immediateChildrenByKind.filter(([_, entries]) => entries.length !== 0);

    const childrenByKindRecursively: [Kind, GlossaryTreeNode[]][] = await Promise.all(
        whereExisting.map(async ([kind, entries]: [Kind, GlossaryEntry[]]) => {
            const recursiveChildren: GlossaryTreeNode[] = await Promise.all(entries.map(getChildrenRecursively));
            const sortedChildren: GlossaryTreeNode[] = recursiveChildren.sort(({ item: a }: GlossaryTreeNode, { item: b }: GlossaryTreeNode) => {
                console.log(
                    `${a.slug} requires [${a.data.requires.map(({ slug }) => slug).join(', ')}] and ${b.slug} requires [${b.data.requires
                        .map(({ slug }) => slug)
                        .join(', ')}]`
                );
                if (a.data.requires.map(({ slug }) => slug).includes(b.slug)) {
                    console.log(`${a.slug} is > ${b.slug}`);
                    return 1;
                }
                if (b.data.requires.map(({ slug }) => slug).includes(a.slug)) {
                    console.log(`${a.slug} is < ${b.slug}`);
                    return -1;
                }
                console.log(`${a.slug} is neither < nor > ${b.slug}`);
                return a.slug.localeCompare(b.slug);
            });
            return [kind, sortedChildren];
        })
    );

    const node: GlossaryTreeNode = { item, childrenByKind: childrenByKindRecursively };
    return node;
};

const modules = await getCollection('glossary', (entry) => !entry.slug.includes('/'));
console.log(modules);

export const tree: GlossaryTreeNode[] = await Promise.all(modules.map(getChildrenRecursively));

// Debug
const debugTreeRecursively = (nodes: GlossaryTreeNode[]) => {
    nodes.forEach((node: GlossaryTreeNode) => {
        console.group('- ' + node.item.slug.split('/').at(-1));
        node.childrenByKind.forEach(([kind, children]: [Kind, GlossaryTreeNode[]]) => {
            console.log(kind);
            debugTreeRecursively(children);
        });
        console.groupEnd();
    });
};
debugTreeRecursively(tree);

export const memberHeadings = {
    function: {
        text: 'Methods',
        desc: 'Member functions associated with',
    },
    type: {
        text: 'Types',
        desc: 'Subtypes of',
    },
    field: {
        text: 'Fields',
        desc: 'Member variables on',
    },
    parameter: {
        text: 'Arguments',
        desc: 'Inputs to',
    },
    return: {
        text: 'Returns',
        desc: 'Outputs from',
    },
    trait: {
        text: 'Traits',
        desc: 'Member traits from',
    },
    constant: {
        text: 'Constants',
        desc: 'Constants associated with',
    },
};
