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
    const aliases: Alias = {};

    const { noun, verb, adjective } = alias;

    if (noun) {
        const { singular, plural } = noun;
        aliases.noun = { singular: singular, plural: plural ?? singular + 's' };
    }

    if (verb) {
        const { infinitive, past, present, continuous, future } = verb;
        const infinitiveEndWithE = infinitive.endsWith('e') ? infinitive : infinitive + 'e';
        const infinitiveWithoutY = infinitive.endsWith('y') ? infinitive.slice(0, -1) : infinitive;
        aliases.verb = {
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
        aliases.adjective = {
            base: base,
            comparative: comparative ?? comparative === null ? 'more ' + base : baseIForY + 'er',
            superlative: superlative ?? superlative === null ? 'most ' + base : baseIForY + 'est',
            noun: noun ?? baseIForY + 'ness',
        };
    }

    return aliases;
};

// const isMatchingAlias = (alias: Alias, word: string): boolean => {
//     const options = [];
//
//     const { noun, verb, adjective } = generateAutoAliases(alias);
//
//     noun && options.push(noun.singular, noun.plural);
//
//     verb && options.push(verb.infinitive, verb.past, verb.present, verb.continuous, verb.future);
//
//     adjective && options.push(adjective.base, adjective.comparative, adjective.superlative, adjective.noun);
//
//     // console.log(options); // For debugging
//
//     return options.includes(word);
// };

export type Kind = 'function' | 'type' | 'field';

export interface GlossaryItem {
    /** Affects reference highlighting */
    kind: Kind;

    /** First item will be used as displayname */
    aliases: Alias[];

    /** Shown on the tooltip */
    brief: string;

    /** Children of the item */
    properties?: { [key: string]: GlossaryItem };
}

export interface GlossaryModule {
    [item: string]: GlossaryItem;
}

export type Glossary = { [module: string]: GlossaryModule };

export const glossary: Glossary = {
    basic: {
        scalar: {
            kind: 'type',
            aliases: [
                { noun: { singular: 'scalar' }, adjective: { base: 'scalar', comparative: null, superlative: null } },
                { noun: { singular: 'number' }, verb: { infinitive: 'number' } },
                { adjective: { base: 'numeric', comparative: null, superlative: null } },
            ],
            brief: 'A singular count or mathematical value. Can be a fraction.',
            properties: {
                exponent: {
                    kind: 'function',
                    aliases: [{ noun: { singular: 'exponent' } }, { noun: { singular: 'power' } }],
                    brief: 'Multiply the base by itself [power] times.',
                    properties: {
                        base: {
                            kind: 'field',
                            aliases: [{ noun: { singular: 'exponent' } }, { noun: { singular: 'power' } }],
                            brief: 'Multiply the base by itself [power] times.',
                        },
                        power: {
                            kind: 'field',
                            aliases: [{ noun: { singular: 'exponent' } }, { noun: { singular: 'power' } }],
                            brief: 'Multiply the base by itself [power] times.',
                        },
                    },
                },
                addition: {
                    kind: 'function',
                    aliases: [{ noun: { singular: 'exponent' } }, { noun: { singular: 'power' } }],
                    brief: 'Multiply the base by itself [power] times.',
                },
                subtraction: {
                    kind: 'function',
                    aliases: [{ noun: { singular: 'exponent' } }, { noun: { singular: 'power' } }],
                    brief: 'Multiply the base by itself [power] times.',
                },
                multiplication: {
                    kind: 'function',
                    aliases: [{ noun: { singular: 'exponent' } }, { noun: { singular: 'power' } }],
                    brief: 'Multiply the base by itself [power] times.',
                },
                division: {
                    kind: 'function',
                    aliases: [{ noun: { singular: 'exponent' } }, { noun: { singular: 'power' } }],
                    brief: 'Multiply the base by itself [power] times.',
                },
            },
        },
        exponent: {
            kind: 'function',
            aliases: [{ noun: { singular: 'exponent' } }, { noun: { singular: 'power' } }],
            brief: 'Multiply the base by itself [power] times.',
        },
    },
};

export type ItemPath = [string, ...string[], string];

export const itemPathToHref = (path: ItemPath): string => '/' + path.join('/');

export const getGlossaryItem = (path: ItemPath): GlossaryItem => {
    console.log(path.join('/'));

    const moduleName = path[0];
    const module: GlossaryModule | undefined = glossary[moduleName];
    if (module === undefined) {
        throw new Error(`'${moduleName}' is not a valid module name.`);
    }

    const rootName = path[1];
    const root: GlossaryItem | undefined = module[rootName];
    if (root === undefined) {
        throw new Error(`'${rootName}' is not a valid item in the module ${moduleName}.`);
    }
    let current: GlossaryItem = root;

    path.slice(2).forEach((part, index) => {
        index += 2; // Account for slice
        const subPath = path.slice(0, index).join('/');
        if (current.properties !== undefined) {
            const property = current.properties[part];
            if (property !== undefined) {
                current = property;
            } else {
                throw new Error(`${part} is not a property of "${subPath}". The valid properties are: [${Object.keys(current.properties).join(', ')}]`);
            }
        } else {
            throw new Error(`"${subPath}" has no properties (looking for '${part}')`);
        }
    });

    return current;
};
