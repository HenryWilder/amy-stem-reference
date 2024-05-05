import { getCollection } from 'astro:content';
import type { GlossaryEntry } from './glossary';

// /** Open delimiter. */
// type ODelim = '{' | '[';
// /** Close delimiter. */
// type CDelim = '}' | ']';

// /** A required argument. */
// type ReqArg = `{${string}}`;
// /** An optional argument. */
// type OptArg = `[${string}]`;
// type Arg = ReqArg | OptArg;

// type ReqString = string;
// type OptString = string | undefined;
// type ArgString = ReqString | OptString;

// /** Remaps an array of {@linkcode ReqArg} | {@linkcode ReqArg} to an array of {@linkcode ReqString} | {@linkcode OptString} respectively. */
// // prettier-ignore
// type ArgRemap<T extends Arg[]> = {
//     [K in keyof T]:
//         T[K] extends ReqArg
//         ? Exclude<ReqString, undefined>
//         : OptString;
// };

// type ArgInfo = { groupName: string; isOptional: boolean };

// /** Finds the argument name and whether it is optional or required. */
// const extractArgInfo = (arg: Arg): ArgInfo => {
//     return {
//         groupName: arg.slice(1, -2),
//         isOptional: arg[0] === '[',
//     };
// };

// /** Token Tree - a regex subroutine for capturing everything within a balanced brace or bracket pair. */
// // prettier-ignore
// type TokenTree =
//     | `(?<${string}>\\{(?:[^\\{\\}]|\\g<${string}>)*\\})`
//     | `(?<${string}>\\[(?:[^\\[\\]]|\\g<${string}>)*\\])?`;

// /** Generates a {@linkcode TokenTree} from {@linkcode ArgInfo}. */
// const tokenTree = ({ groupName, isOptional }: ArgInfo): TokenTree => {
//     // prettier-ignore
//     return isOptional
//         ? `(?<${groupName}>\\{(?:[^\\{\\}]|\\g<${groupName}>)*\\})`
//         : `(?<${groupName}>\\[(?:[^\\[\\]]|\\g<${groupName}>)*\\])?`;
// };

// /** The second parameter of a regex replace operation */
// type Replacer<T extends ArgString[]> = (substring: string, ...args: T) => string;

// type PreprocCmd<T extends Arg[]> = (replacer: Replacer<ArgRemap<T>>) => Preprocessor;

/** A function which transforms text according to a preprocCmd */
type Preprocessor = ((tex: string) => Promise<string>) | ((tex: string) => string);

// /**
//  *
//  * @param cmd The name of the preprocessor command.
//  * @param args A list of {@linkcode Arg}s naming the regex capture groups and whether they are optional or required.
//  * @returns A function which can be passed a {@linkcode Replacer} to create a {@linkcode Preprocessor}.
//  */
// const preprocCmdGenerator = <T extends Arg[]>(cmd: string, ...args: T): ((replacer: Replacer<ArgRemap<T>>) => Preprocessor) => {
//     const str = `\\\\${cmd}${args.map(extractArgInfo).map(tokenTree).join('')}`;
//     console.log(`preprocCmdGenerator'(${cmd}, ${args.join(', ')})' produced the regex /${str}/`);
//     const rx = RegExp(str);

//     const preprocCmd: (replacer: Replacer<ArgRemap<T>>) => Preprocessor = (replacer: Replacer<ArgRemap<T>>) => {
//         return (str: string): string => {
//             return str.replace(rx, replacer);
//         };
//     };

//     return preprocCmd;
// };

// // Should pass
// const pass1a = preprocCmdGenerator<[ReqArg, OptArg]>('test', '{apple}', '[orange]');
// const pass1Replacer = (_substring: string, apple: ReqString, orange: OptString) => apple + orange;
// const pass1b = pass1a(pass1Replacer);

// // Should fail due to required arg in generator being optional in replacer
// const fail1a = preprocCmdGenerator<[ReqArg, ReqArg]>('test', '{apple}', '{orange}');
// const fail1Replacer = (_substring: string, apple: ReqString, orange: OptString) => apple + orange;
// const fail1b = fail1a(fail1Replacer);

// // Should fail due to optional arg in generator being required in replacer
// const fail2a = preprocCmdGenerator<[ReqArg, OptArg]>('test', '{apple}', '[orange]');
// const fail2Replacer = (_substring: string, apple: ReqString, orange: ReqString) => apple + orange;
// const fail2b = fail1a(fail1Replacer);

/**
 * List of preprocessors for macro-style tex that requires more than a simple macro can handle.
 * (like access to the Astro content collections)
 */
export const preprocs: Preprocessor[] = [
    // \nth{}
    // ---
    // #1 is a number or string (superscript will be auto-generated)
    (tex: string): string => {
        return tex.replace(/\\nth\{(.*?)\}/g, (_substring: string, n: string) => {
            let th: string;
            if (n.match(/^-?(?:[0-9]*[02-9])?[1-3]$/)) {
                const ones = n.at(-1)! as '1' | '2' | '3';
                switch (ones) {
                    case '1':
                        th = 'st';
                        break;
                    case '2':
                        th = 'nd';
                        break;
                    case '3':
                        th = 'rd';
                        break;
                }
            } else {
                th = 'th';
            }
            const replacement = `{\\({${n}}^{\\text{${th}}}\\)}`;
            // console.log(`replaced '${_substring}' with '${replacement}'`); // debug
            return replacement;
        });
    },

    // \ref{}[] or \ref{}
    // ---
    // {#1} is slug
    // [#2] is content
    async (tex: string): Promise<string> => {
        const rxRef = /\\ref\{(.*?)\}(?:\[(.*?)\])?/g;
        const allEntries = tex.match(rxRef) ? await getCollection('glossary') : undefined;
        return tex.replace(rxRef, (_substring: string, slug: string, content: string | undefined) => {
            if (allEntries === undefined) {
                throw new Error('allEntries must be defined if any \\ref macros exist');
            }
            const item: GlossaryEntry | undefined = allEntries.find((entry: GlossaryEntry) => entry.slug === slug);
            if (item === undefined) {
                throw new Error(`The slug '${slug}' could not be matched to a valid glossary entry`);
            }
            const href = '#' + item.slug.replace(/\//g, '+');
            const kind = item.data.kind;
            const tooltip = `\\text{${item.data.brief}}`;
            const name = content ?? `\\text{${slug.split('/').at(-1)}}`;
            const fullRef = `\\fullref{${href}}{${kind}}{${name}}{${tooltip}}`;
            console.log(`replaced '${_substring}' with '${fullRef}'`); // debug
            return fullRef;
        });
    },
];
