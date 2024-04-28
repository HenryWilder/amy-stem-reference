const validKeywords = ['null', 'module', 'function', 'operator', 'type', '->', '=>'] as const;
export type ValidKeyword = (typeof validKeywords)[number];
export const isValidKeyword = (x: any): x is ValidKeyword => validKeywords.map((kw) => kw as string).includes(x);
