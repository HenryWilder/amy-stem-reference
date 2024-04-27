const validKeywords = ['null', 'module', 'fn', 'type', '->', '=>'] as const;
export type ValidKeyword = (typeof validKeywords)[number];
export const isValidKeyword = (x: any): x is ValidKeyword => validKeywords.map((kw) => kw as string).includes(x);
