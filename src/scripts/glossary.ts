interface Alias {
    /** If undefined, the word has no noun form */
    noun?: {
        /** The default */
        singular: string;

        /** If undefined, assume simple (singular + "s") */
        plural?: string;
    };

    /** If undefined, the word has no verb form */
    verb?: {
        /** The default */
        infinitive: string;

        /** If undefined, assume infinitive + "ed" */
        past?: string;

        /** If undefined, assume infinitive + "es" */
        present?: string;

        /** If undefined, assume infinitive [removing trailing 'y'] + "ing" */
        continuous?: string;

        /** If undefined, assume same as infinitive */
        future?: string;
    };

    /** If undefined, the word has no adjective form */
    adjective?: {
        /** The default */
        base: string;

        /** If undefined, assume base [replace trailing 'y' with 'i'] + "er"; if null, assume "more " + base */
        comparative?: string | null;

        /** If undefined, assume base [replace trailing 'y' with 'i'] + "est"; if null, assume "most " + base */
        superlative?: string | null;

        /** If undefined, assume base + "ness" */
        noun?: string;
    };
}

export const generateAutoAliases = (alias: Alias): Alias => {
    const result: Alias = {};

    const { noun, verb, adjective } = alias;

    if (noun) {
        const { singular, plural } = noun;
        result.noun = { singular: singular, plural: plural ?? singular + 's' };
    }

    if (verb) {
        const { infinitive, past, present, continuous, future } = verb;
        const infinitiveEndWithE = infinitive.endsWith('e') ? infinitive : infinitive + 'e';
        const infinitiveWithoutY = infinitive.endsWith('y') ? infinitive.slice(0, -1) : infinitive;
        result.verb = {
            infinitive: infinitive,
            past: past ?? infinitiveEndWithE + 'd',
            present: present ?? infinitive + 's',
            continuous: continuous ?? infinitiveWithoutY + 'ing',
            future: future ?? infinitive,
        };
    }

    if (adjective) {
        const { base, comparative, superlative, noun } = adjective;
        const baseIForY = base.endsWith('y') ? base.slice(0, -1) + 'i' : base;
        result.adjective = {
            base: base,
            comparative: comparative ?? comparative === null ? 'more ' + base : baseIForY + 'er',
            superlative: superlative ?? superlative === null ? 'most ' + base : baseIForY + 'est',
            noun: noun ?? baseIForY + 'ness',
        };
    }

    return result;
};

const isMatchingAlias = (alias: Alias, word: string): boolean => {
    const options = [];

    const { noun, verb, adjective } = generateAutoAliases(alias);

    noun && options.push(noun.singular, noun.plural);

    verb && options.push(verb.infinitive, verb.past, verb.present, verb.continuous, verb.future);

    adjective && options.push(adjective.base, adjective.comparative, adjective.superlative, adjective.noun);

    // console.log(options); // For debugging

    return options.includes(word);
};

export interface GlossaryItem {
    /** The type the item is a field or method of (leave undefined if the item is a type) */
    propertyOf?: string;

    /** Affects reference highlighting */
    kind: string;

    /** First item will be used as displayname */
    aliases: Alias[];

    /** Shown on the tooltip */
    brief: string;
}

export const glossaryItemToString = (item: GlossaryItem): string => {
    const { kind, brief, propertyOf } = item;
    const name = getItemDefaultAlias(item);
    const propertyOfPreamble = propertyOf ? ` within ${propertyOf}` : '';
    return `{ ${kind}${propertyOfPreamble}: ${name} - ${brief} }`;
};

export const getItemDefaultAlias = (item: GlossaryItem): string => {
    const { noun, verb, adjective } = item.aliases[0];
    return (
        noun?.singular ??
        verb?.infinitive ??
        adjective?.base ??
        (() => {
            throw new Error(`The first alias of the glossary item ${glossaryItemToString(item)} has no noun, verb, nor adjective form.`);
        })()
    );
};

import glossaryData from '../../public/glossary.json';
export const glossary: { [module: string]: { [name: string]: GlossaryItem } } = glossaryData;
export const modules: string[] = Object.keys(glossary);

export interface RefKey {
    /** The module the reference belongs to */
    module: string;

    /** The type the reference is a field or method of (leave undefined if the reference is a type) */
    propertyOf?: string;

    /** Any alias of the reference */
    term: string;
}

const getRefString = (key: RefKey): string => {
    return key.propertyOf ? `${key.module}::${key.propertyOf}#${key.term}` : `${key.module}::${key.term}`;
};

export type ItemPath = [string, string | undefined, string];

export const getItemPath = (item: GlossaryItem): ItemPath => {
    for (const module in glossary) {
        for (const term in glossary[module]) {
            if (glossary[module][term] === item) {
                return [module, item.propertyOf, term];
            }
        }
    }
    throw new Error(`Could not locate the item ${glossaryItemToString(item)} in the glossary`);
};

export const itemPathToHref = (path: ItemPath): string => {
    const [module, propertyOf, term] = path;
    return `/${module}/` + (propertyOf ? `${propertyOf}#` : '') + term;
};

export const getItemHref = (item: GlossaryItem): string => itemPathToHref(getItemPath(item));

export const itemPathToRefKey = (path: ItemPath): RefKey => {
    const [module, propertyOf, term] = path;
    return { module, propertyOf, term };
};

export const getItemRefKey = (item: GlossaryItem): RefKey => {
    return itemPathToRefKey(getItemPath(item));
};

export const findReference = (key: RefKey): GlossaryItem => {
    const { module, propertyOf, term } = key;
    const termLower = term.toLowerCase();
    const matches: GlossaryItem[] = Object.values(glossary[module])
        .filter((item: GlossaryItem) => item.propertyOf === propertyOf)
        .filter((item: GlossaryItem) => item.aliases.find((alias) => isMatchingAlias(alias, termLower)));

    if (matches.length === 1) {
        return matches[0];
    } else if (matches.length > 1) {
        throw new Error(`Multiple glossary entries matching "${getRefString(key)}" exist, intent ambiguous`);
    } else {
        throw new Error(`No glossary entry matching "${getRefString(key)}" exists`);
    }
};

export const isReference = (key: RefKey): boolean => {
    try {
        findReference(key);
        return true;
    } catch {
        return false;
    }
};
