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

    /** Relative path (assume a '/' will be prepended) */
    href: string;
}

export const getItemDefaultAlias = (item: GlossaryItem): string => {
    const { noun, verb, adjective } = item.aliases[0];
    return (
        noun?.singular ??
        verb?.infinitive ??
        adjective?.base ??
        (() => {
            throw new Error(`The first alias of the glossary item "${item.brief}" (${item.href}) has no noun, verb, nor adjective form.`);
        })()
    );
};

import glossaryData from '../../public/glossary.json';
export const glossary: { [module: string]: GlossaryItem[] } = glossaryData;
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

export const getItemModule = (item: GlossaryItem): string => {
    for (const module in glossary) {
        if (glossary[module].find((x) => x.href === item.href)) {
            return module;
        }
    }
    throw new Error(`Could not locate the item "${item.href}" in the glossary`);
};

export const getItemRefKey = (item: GlossaryItem): RefKey => {
    const module = getItemModule(item);
    const propertyOf = item.propertyOf;
    const term = getItemDefaultAlias(item);
    return { module, propertyOf, term };
};

export const findReference = (key: RefKey): GlossaryItem => {
    const { module, propertyOf, term } = key;
    const termLower = term.toLowerCase();
    const matches: GlossaryItem[] = glossary[module]
        .filter((item) => item.propertyOf === propertyOf)
        .filter((item) => item.aliases.find((alias) => isMatchingAlias(alias, termLower)));

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
