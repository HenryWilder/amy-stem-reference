/**
 * Union of all value types present in T.
 */
export type valueof<T> = T[keyof T];

/**
 * The never of all properties in T.
 */
export type NeverAny<T> = { [P in keyof T]: never };

/**
 * The undefinition of all properties in T.
 * Allows properties to still be accessed even if they shouldn't exist.
 */
export type UndefineAll<T> = { [P in keyof T]?: undefined };

/**
 * The exclusion of all X properties present in T.
 * Equivalent to setminus.
 */
export type Without<T, X> = { [P in keyof (T | X)]: Exclude<T[P], X[P]> };

/**
 * The intersection of Y and M if a value compatible with M is assigned; the intersection of N and (F - M) otherwise.
 * @param F Full range of options for narrowing match
 * @param M Match pattern
 * @param Y Type when yes matching
 * @param N Type when not matching (defaults to the un-definition of all properties in Y)
 *
 * @example
 * ```
 * type Fruit = 'apple' | 'orange' | 'banana' | 'mango';
 * const apple: Conditional<T, 'banana', { isPeeled: boolean }>
 * ```
 */
export type Conditional<F, M, Y, N = NeverAny<Y>> = (M & Y) | (Without<F, M> & N);
