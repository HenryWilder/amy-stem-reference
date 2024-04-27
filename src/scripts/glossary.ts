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
            present: present ?? infinitiveEndWithE + 's',
            continuous: continuous ?? infinitiveWithoutY + 'ing',
            future: future ?? infinitive,
        };
    }

    if (adjective) {
        const { base, comparative, superlative, noun } = adjective;
        const baseIForY = base.endsWith('y') ? base.slice(0, -1) + 'i' : base;
        result.adjective = {
            base: base,
            comparative: comparative ?? comparative === null ? base : baseIForY + 'er',
            superlative: superlative ?? superlative === null ? base : baseIForY + 'est',
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

    console.log(options); // For debugging

    return options.includes(word);
};

export interface GlossaryItem {
    /** First item will be used as displayname */
    aliases: Alias[];

    /** Shown on the tooltip */
    brief: string;

    /** Relative path (assume a '/' will be prepended) */
    href: string;
}

import glossaryData from '../../public/glossary.json';

const glossary: GlossaryItem[] = glossaryData;

export const findReference = (key: string): GlossaryItem => {
    const item: GlossaryItem | undefined = glossary.find((item) => item.aliases.find((alias) => isMatchingAlias(alias, key)));
    if (item === undefined) {
        throw new Error(`Failed to locate any aliases matching "${key}" in the glossary.`);
    }
    return item;
};
