import { type Glossary } from './glossary';

export const glossary: Glossary = {
    basic: {
        scalar: {
            kind: 'type',
            aliases: ['Scalar', 'Number', 'Numeric'],
            description: ['A singular count or mathematical value. Can be a [fraction].'],
            properties: {
                exponent: {
                    kind: 'function',
                    aliases: ['Exponent'],
                    description: ['[Multiply] the [base] by itself [power] times.'],
                    notation: 'x^y',
                    properties: {
                        base: {
                            kind: 'field',
                            aliases: ['Base'],
                            description: [''],
                            fieldData: {
                                ty: ['basic', 'scalar'],
                                notationRef: 'x',
                            },
                        },
                        power: {
                            kind: 'field',
                            aliases: ['Power'],
                            description: [''],
                            fieldData: {
                                ty: ['basic', 'scalar'],
                                notationRef: 'y',
                            },
                        },
                    },
                },
                addition: {
                    kind: 'function',
                    aliases: ['Addition', 'Add'],
                    description: ['todo'],
                },
                subtraction: {
                    kind: 'function',
                    aliases: ['Subtraction', 'Less', 'Sub', 'Minus'],
                    description: ['todo'],
                },
                multiplication: {
                    kind: 'function',
                    aliases: ['Multiply', 'Times'],
                    description: ['todo'],
                },
                division: {
                    kind: 'function',
                    aliases: ['Divide'],
                    description: ['todo'],
                },
            },
        },
        exponent: {
            kind: 'function',
            aliases: ['Exponent', 'Power'],
            description: ['todo'],
        },
    },
} as const;
