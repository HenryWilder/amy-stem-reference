const validKeywords = ['null', 'module', 'field', 'function', 'operator', 'type', 'trait', '->', '=>'] as const;
export type ValidKeyword = (typeof validKeywords)[number];
export const isValidKeyword = (x: any): x is ValidKeyword => validKeywords.map((kw) => kw as string).includes(x);
