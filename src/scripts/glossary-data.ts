import { getGlossaryItem, type Glossary, type ItemLink, type ItemPath } from './glossary';

const ref = (text: string, rel: string = text.toLowerCase()): ItemLink => {
    return { text, rel: rel.split('::') };
};

const tex = (tex: string) => {
    return { tex };
};

export const relToPath = (startIn: ItemPath, rel: string[]): ItemPath => {
    let absPath: ItemPath = [...startIn];
    // Look around inside the glossary at this level, then go up one level at a time. Never go deeper than 1 level without matching rel.
    while (absPath.length > 0) {
        console.log(`Searching in '${absPath.join('::')}' for '${rel.join('::')}'`);
        const searchItem = getGlossaryItem(absPath);
        for (const key in searchItem.properties) {
            console.log(' ', key);
            if (key === rel[0]) {
                absPath.push(...rel);
                console.log(`Successfully located ${absPath.join('::')}`);
                return absPath;
            }
        }
        absPath.pop();
    }
    throw new Error(`No path found for the rel '${rel.join('::')}' starting in '${startIn.join('::')}'`);
};

export const glossary: Glossary = {
    basic: {
        scalar: {
            kind: 'type',
            aliases: ['Scalar', 'Number', 'Numeric'],
            description: [['A singular count or mathematical value. Can be a ', 'fraction', '.']],
            properties: {
                pow: {
                    kind: 'function',
                    aliases: ['Exponent', 'Raise to the Power of'],
                    description: [
                        [ref('Multiply', 'mul'), ' the ', ref('base'), ' by ', ref('itself', 'base'), ' ', ref('power'), '-times.'],
                        [
                            tex(
                                '\\def\\xn#1{\\overset{\\tiny#1}{x}}' +
                                    'x^1 = \\xn1 \\\\' +
                                    'x^2 = \\xn1 \\times \\xn2 \\\\' +
                                    'x^3 = \\xn1 \\times \\xn2 \\times \\xn3 \\\\' +
                                    '\\vdots \\\\' +
                                    'x^n = \\xn1 \\times \\xn2 \\times \\ldots \\times \\xn{n}'
                            ),
                        ],
                    ],
                    notation: 'x^y',
                    properties: {
                        base: {
                            kind: 'field',
                            aliases: ['Base'],
                            description: [['The number being ', ref('multiplied', 'mul'), ' by itself.']],
                            fieldData: {
                                ty: ['basic', 'scalar'],
                                notationRef: 'x',
                            },
                        },
                        power: {
                            kind: 'field',
                            aliases: ['Power'],
                            description: [['The number of times to ', ref('multiply', 'mul'), ' the ', ref('base'), ' by ', ref('itself', 'base')]],
                            fieldData: {
                                ty: ['basic', 'scalar'],
                                notationRef: 'y',
                            },
                        },
                    },
                },
                add: {
                    kind: 'function',
                    aliases: ['Add', 'Addition'],
                    description: [['todo']],
                },
                sub: {
                    kind: 'function',
                    aliases: ['Subtract', 'Subtraction', 'Minus', 'Less'],
                    description: [['todo']],
                },
                mul: {
                    kind: 'function',
                    aliases: ['Multiply', 'Times'],
                    description: [['todo']],
                },
                div: {
                    kind: 'function',
                    aliases: ['Divide'],
                    description: [['todo']],
                },
            },
        },
        exponent: {
            kind: 'function',
            aliases: ['Exponent', 'Power'],
            description: [['todo']],
        },
    },
} as const;
