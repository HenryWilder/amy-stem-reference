/** Require `T = Parts.join(Separator)` */
export type JoinedString<Parts extends string[], Separator extends string> = Parts extends []
    ? ''
    : Parts extends [infer Only extends string]
    ? Only
    : Parts extends [infer First extends string, ...infer Rest extends string[]]
    ? `${First}${Separator}${JoinedString<Rest, Separator>}`
    : never;

// Tests
{
    {
        let mustBeEmpty: JoinedString<[], '/'>;

        // @ts-expect-no-error
        mustBeEmpty = '';

        // @ts-expect-error
        mustBeEmpty = 'apple';

        // @ts-expect-error
        mustBeEmpty = 'apple/orange';
    }

    {
        let mustBeApple: JoinedString<['apple'], '/'>;

        // @ts-expect-error
        mustBeApple = '';

        // @ts-expect-no-error
        mustBeApple = 'apple';

        // @ts-expect-error
        mustBeApple = 'apple/orange';
    }

    {
        let mustBeAppleOrange: JoinedString<['apple', 'orange'], '/'>;

        // @ts-expect-error
        mustBeAppleOrange = 'apple';

        // @ts-expect-no-error
        mustBeAppleOrange = 'apple/orange';

        // @ts-expect-error
        mustBeAppleOrange = 'apple/banana';
    }

    {
        let mustBeAppleOrangeBanana: JoinedString<['apple', 'orange', 'banana'], '/'>;

        // @ts-expect-error
        mustBeAppleOrangeBanana = 'apple';

        // @ts-expect-error
        mustBeAppleOrangeBanana = 'apple/orange';

        // @ts-expect-no-error
        mustBeAppleOrangeBanana = 'apple/orange/banana';

        // @ts-expect-error
        mustBeAppleOrangeBanana = 'apple/orange/mango';
    }

    {
        let mustBeHyphenSeparated: JoinedString<['apple', 'orange', 'banana'], '-'>;

        // @ts-expect-error
        mustBeHyphenSeparated = 'apple';

        // @ts-expect-error
        mustBeHyphenSeparated = 'apple-orange';

        // @ts-expect-no-error
        mustBeHyphenSeparated = 'apple-orange-banana';

        // @ts-expect-error
        mustBeHyphenSeparated = 'apple-orange-mango';
    }

    {
        let mustBeEllipsisSeparated: JoinedString<['apple', 'orange', 'banana'], '...'>;

        // @ts-expect-error
        mustBeEllipsisSeparated = 'apple';

        // @ts-expect-error
        mustBeEllipsisSeparated = 'apple...orange';

        // @ts-expect-no-error
        mustBeEllipsisSeparated = 'apple...orange...banana';

        // @ts-expect-error
        mustBeEllipsisSeparated = 'apple...orange...mango';
    }
}

/** Require `T = Parts.concat()` */
export type ConcatenatedString<Parts extends string[]> = JoinedString<Parts, ''>;

/** Require `T = Full.split(Separator)` */
export type SplitString<Full extends string, Separator extends string> = Full extends ''
    ? []
    : Full extends `${infer Prefix}${Separator}${infer Suffix}`
    ? [...SplitString<Prefix, Separator>, ...SplitString<Suffix, Separator>]
    : [Full];

// Tests
{
    {
        let mustBeEmpty: SplitString<'', '/'>;

        // @ts-expect-no-error
        mustBeEmpty = [];

        // @ts-expect-error
        mustBeEmpty = [''];

        // @ts-expect-error
        mustBeEmpty = ['apple'];
    }

    {
        let mustBeApple: SplitString<'apple', '/'>;

        // @ts-expect-error
        mustBeApple = [];

        // @ts-expect-error
        mustBeApple = [''];

        // @ts-expect-no-error
        mustBeApple = ['apple'];
    }

    {
        let mustBeAppleOrange: SplitString<'apple/orange', '/'>;

        // @ts-expect-error
        mustBeAppleOrange = [];

        // @ts-expect-error
        mustBeAppleOrange = [''];

        // @ts-expect-error
        mustBeAppleOrange = ['apple'];

        // @ts-expect-no-error
        mustBeAppleOrange = ['apple', 'orange'];
    }
}
