import { z, defineCollection, reference } from 'astro:content';
import { kinds } from '../scripts/glossary';

type Test = { a: 2 } | (({ a: 0 } | { a: 1; b: 0 }) & { c: 0 });

const glossaryCollection = defineCollection({
    type: 'content',
    schema: z.intersection(
        z.object({
            brief: z.string().describe('what appears on the tooltip'),
            aliases: z.record(z.string().describe('the name of the alias'), z.enum(kinds).describe('the kind of the alias')).default({}),
            isStatic: z.boolean().default(false).describe('whether the object is external to its container'),
        }),
        z.union([
            // has nothing
            z.object({
                kind: z.enum(kinds).exclude(['field', 'parameter', 'return', 'function', 'constant', 'type']),
            }),
            // has typeUnion
            z.object({
                kind: z.enum(['field', 'parameter', 'return']),
                typeUnion: z.array(reference('glossary')).min(1),
            }),
            // has notation
            z.intersection(
                z.union([
                    // no no traits
                    z.object({
                        kind: z.enum(['function', 'constant']),
                    }),
                    // has traits
                    z.object({
                        kind: z.enum(['type']),
                        traits: z.array(reference('glossary')).default([]).describe('trait(s) the type implements'),
                    }),
                ]),
                z.object({
                    notation: z.string().describe('how the type, function, or constant is written'),
                })
            ),
        ])
    ),
});

export const collections = {
    glossary: glossaryCollection,
};
