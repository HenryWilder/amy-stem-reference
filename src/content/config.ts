import { z, defineCollection, reference } from 'astro:content';
import { kinds } from '../scripts/glossary';

const glossaryCollection = defineCollection({
    type: 'content',
    schema: z.intersection(
        z.object({
            brief: z.string().describe('what appears on the tooltip'),
            requires: z.array(reference('glossary')).default([]).describe('items that should be sorted in front of this item'),
            examples: z
                .array(
                    z.union([
                        z.object({
                            name: z.string().describe('the name of the example'),
                            math: z.string().describe("the example's katex"),
                        }),
                        z.string().describe("the example's katex"),
                    ])
                )
                .min(1)
                .optional(),
            aliases: z.record(z.string().describe('the name of the alias'), z.enum(kinds).describe('the kind of the alias')).default({}),
            isStatic: z.boolean().default(false).describe('whether the object is external to its container'),
        }),
        z.union([
            // has nothing
            z.object({
                kind: z.enum(['module']),
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
                        kind: z.enum(['type', 'trait']),
                        traits: z.array(reference('glossary')).default([]).describe('trait(s) being implemented'),
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
