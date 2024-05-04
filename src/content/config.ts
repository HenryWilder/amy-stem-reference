import { z, defineCollection, reference } from 'astro:content';
import { kinds } from '../scripts/glossary';

const glossaryCollection = defineCollection({
    type: 'content',
    schema: z
        .object({
            brief: z.string().describe('This appears on the tooltip'),
            kind: z.enum(kinds),
            aliases: z.record(z.string(), z.enum(kinds)).optional(),
            notation: z.string().optional(),
            isStatic: z.boolean().default(false),

            // for kind === 'field'
            typeUnion: z.array(reference('glossary')).optional(),

            // for kind === 'type'
            traits: z.array(reference('glossary')).optional(),
        })
        .superRefine((val, ctx) => {
            // typeUnion
            if (val.kind === 'field' || val.kind === 'parameter' || val.kind === 'return') {
                if (val.typeUnion === undefined || val.typeUnion.length === 0) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: `${val.kind} must have typeUnion`,
                        path: ['kind', 'typeUnion'],
                    });
                }
            } else {
                if (val.typeUnion !== undefined) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: `${val.kind} cannot have typeUnion`,
                        path: ['kind', 'typeUnion'],
                    });
                }
            }

            // type
            if (val.kind !== 'type') {
                if (val.traits !== undefined) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: 'only type can have traits',
                        path: ['kind', 'traits'],
                    });
                }
            }

            // notation
            if (val.kind === 'type' || val.kind === 'function' || val.kind === 'constant') {
                if (val.notation === undefined) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: `${val.kind} must have notation`,
                        path: ['kind', 'notation'],
                    });
                }
            } else {
                if (val.notation !== undefined) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: `${val.kind} cannot have notation`,
                        path: ['kind', 'notation'],
                    });
                }
            }
        }),
});

export const collections = {
    glossary: glossaryCollection,
};
