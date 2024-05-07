import { z, defineCollection, reference } from 'astro:content';
import { kinds } from '../scripts/glossary';

const glossaryCollection = defineCollection({
    type: 'content',
    schema: z.intersection(
        z.object({
            brief: z.string().describe('what appears on the tooltip'),
            aliases: z.record(z.string().describe('the name of the alias'), z.enum(kinds).describe('the kind of the alias')).default({}),
            isStatic: z.boolean().default(false).describe('whether the object is external to its container'),
        }),
        z.union([
            z.object({
                kind: z.enum(kinds).exclude(['field', 'parameter', 'return', 'function', 'constant', 'type']),
            }),
            // has typeUnion
            z.object({
                kind: z.enum(['field', 'parameter', 'return']),
                typeUnion: z.array(reference('glossary')).min(1),
            }),
            // has notation but no traits
            z.object({
                kind: z.enum(['function', 'constant']),
                notation: z.string().describe('how the function or constant is written'),
            }),
            // has traits and optionally notation
            z.object({
                kind: z.enum(['type']),
                traits: z.array(reference('glossary')).default([]).describe('trait(s) the type implements'),
                notation: z.string().optional().describe('how the type is written'),
            }),
        ])
    ),
});

export const collections = {
    glossary: glossaryCollection,
};
