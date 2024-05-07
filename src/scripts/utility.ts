/** Require `T = Parts.join(Separator)` */
export type JoinedString<Parts extends string[], Separator extends string> = Parts extends []
    ? ''
    : Parts extends [infer Only extends string]
    ? Only
    : Parts extends [infer First extends string, ...infer Rest extends string[]]
    ? `${First}${Separator}${JoinedString<Rest, Separator>}`
    : never;

/** Require `T = Parts.concat()` */
export type ConcatenatedString<Parts extends string[]> = JoinedString<Parts, ''>;

/** Require `T = Full.split(Separator)` */
export type SplitString<Full extends string, Separator extends string> = Full extends ''
    ? []
    : Full extends `${infer Prefix}${Separator}${infer Suffix}`
    ? [...SplitString<Prefix, Separator>, ...SplitString<Suffix, Separator>]
    : [Full];
