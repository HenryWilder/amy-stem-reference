import { kinds } from './glossary';

const validKeywords = ['null', '->', '=>', 'static', 'extends', 'implements', ...kinds] as const;
export type ValidKeyword = (typeof validKeywords)[number];
export const isValidKeyword = (x: any): x is ValidKeyword => validKeywords.map((kw) => kw as string).includes(x);
