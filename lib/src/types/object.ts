/**
 * {@link PropertyKey} without number, filtered on keys the object actually has
 *
 * Used for proxies. Number inputs for `obj[0]` are converted to a string, so
 * there's a discrepancy in some types where you only have `string | symbol` and
 * other places where it's `string | symbol | number` where the number is
 * converted to a string and typing gets a little messed up.
 *
 * Hopefully this can avoid it a little bit, but it's probably just a figment
 * of my imagination..
 */
export type Property<T = any> = Exclude<keyof T, number>
