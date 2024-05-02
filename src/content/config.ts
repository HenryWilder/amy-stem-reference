import { z, defineCollection, reference } from 'astro:content';
import { kinds } from '../scripts/glossary';

const glossaryCollection = defineCollection({
    type: 'content',
    schema: z
        .object({
            kind: z.enum(kinds),
            aliases: z.record(z.string(), z.enum(kinds)).optional(),
            notation: z.string().optional(),

            // for kind === 'field'
            type: z.array(reference('glossary')).optional(),

            // for kind === 'function'
            parameters: z.array(reference('glossary')).optional(),
            returns: z.record(z.string(), z.array(reference('glossary'))).optional(),

            // for kind === 'type'
            members: z
                .object({
                    types: z.array(reference('glossary')),
                    fields: z.array(reference('glossary')),
                    methods: z.array(reference('glossary')),
                })
                .optional(),
        })
        .superRefine((val, ctx) => {
            // field
            if (val.kind === 'field') {
                if (val.type === undefined || val.type.length === 0) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: `field must have${val.type?.length === 0 ? ' at least one' : ''} type`,
                        path: ['kind', 'type'],
                    });
                }
            } else {
                if (val.type !== undefined) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: 'only field can have type',
                        path: ['kind', 'type'],
                    });
                }
            }

            // function
            if (val.kind === 'function') {
                if (val.parameters === undefined) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: 'function must have parameters',
                        path: ['kind', 'parameters'],
                    });
                }
                if (val.returns === undefined) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: 'function must have returns',
                        path: ['kind', 'returns'],
                    });
                }
            } else {
                if (val.parameters !== undefined) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: 'only function can have parameters',
                        path: ['kind', 'parameters'],
                    });
                }
                if (val.returns !== undefined) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: 'only function can have returns',
                        path: ['kind', 'returns'],
                    });
                }
            }

            // type
            if (val.kind === 'type') {
                if (val.members === undefined) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: 'type must have members',
                        path: ['kind', 'members'],
                    });
                }
            } else {
                if (val.members !== undefined) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: 'only type can have members',
                        path: ['kind', 'members'],
                    });
                }
            }

            // notation
            if (val.kind === 'type' || val.kind === 'function') {
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
