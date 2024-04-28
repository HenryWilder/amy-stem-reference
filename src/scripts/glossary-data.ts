import { getGlossaryItem, type DescriptionLine, type Glossary, type ItemLink, type ItemPath } from './glossary';

const ref = (text: string, rel: string = text.toLowerCase()): ItemLink => {
    console.log(rel.split('::'));
    return { text, rel: rel.split('::') };
};

const tex = (tex: string) => {
    return { tex };
};

export const relToPath = (startIn: ItemPath, rel: string[]): ItemPath => {
    const upPath: ItemPath = [...startIn];

    const rootPathToStr = (path: string[]) => (path.length !== 0 ? path.join('::') : '[ROOT]');

    const getGlossaryLayer = (path: string[]): { [key: string]: object } | undefined => {
        switch (path.length) {
            case 0:
                return glossary;
            case 1:
                return glossary[path[0]];
            default:
                return getGlossaryItem(path as ItemPath).properties;
        }
    };

    // Look around inside the glossary at this level, then go up one level at a time. Never go deeper than 1 level without matching rel.
    while (true) {
        console.log(`Searching in '${rootPathToStr(upPath)}' for '${rootPathToStr(rel)}'`);
        for (const key in getGlossaryLayer(upPath)) {
            console.log(' ', key);
            if (key === rel[0]) {
                console.log(`Found '${key}' in '${rootPathToStr(upPath)}'`);
                const downPath = [...upPath];
                let fullPathMatch = true;
                for (const part of rel) {
                    console.log(`Looking for '${part}' in '${rootPathToStr(downPath)}'`);
                    const layer = getGlossaryLayer(downPath);
                    if (layer && Object.keys(layer).includes(part)) {
                        console.log(`Found for '${part}' in '${rootPathToStr(downPath)}'`);
                        downPath.push(part);
                    } else {
                        console.log(`Could not find '${part}' in '${rootPathToStr(downPath)}', cancelling this downPath`);
                        fullPathMatch = false;
                        break;
                    }
                }
                if (fullPathMatch) {
                    console.log(`Successfully located ${rootPathToStr(downPath)}`);
                    return downPath as ItemPath;
                }
            }
        }
        if (upPath.length === 0) break;
        upPath.pop();
    }
    throw new Error(`No path found for the rel '${rootPathToStr(rel)}' starting in '${rootPathToStr(startIn)}'`);
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
                        [
                            ref('Multiply', 'scalar::mul'),
                            ' the ',
                            ref('base', 'basic::scalar::pow::base'),
                            ' by ',
                            ref('itself', 'basic::scalar::pow::base'),
                            ' ',
                            ref('power', 'basic::scalar::pow::power'),
                            '-times.',
                        ],
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
                            description: [['The number being ', ref('multiplied', 'basic::scalar::mul'), ' by itself.']],
                            fieldData: {
                                ty: ['basic', 'scalar'],
                                notationRef: 'x',
                            },
                        },
                        power: {
                            kind: 'field',
                            aliases: ['Power'],
                            description: [
                                [
                                    'The number of times to ',
                                    ref('multiply', 'basic::scalar::mul'),
                                    ' the ',
                                    ref('base', 'basic::scalar::pow::base'),
                                    ' by ',
                                    ref('itself', 'basic::scalar::pow::base'),
                                ],
                            ],
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
};
