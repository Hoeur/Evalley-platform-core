/**
 * Identifier primitives.
 *
 * The platform standardizes on ULIDs (Crockford base32, 26 chars, lexicographically
 * sortable). Ids are branded so a raw `string` cannot be passed where an id is expected.
 */

/** Nominal typing helper. */
export type Brand<T, B extends string> = T & { readonly __brand: B };

/** A ULID string (26 chars, Crockford base32, excludes I, L, O, U). */
export type Ulid = Brand<string, "Ulid">;

/** Canonical platform identifier type. */
export type Id = Ulid;

const ULID_PATTERN = /^[0-9A-HJKMNP-TV-Z]{26}$/;

/** Type guard: is this string a syntactically valid ULID? */
export function isUlid(value: string): value is Ulid {
  return ULID_PATTERN.test(value);
}

/**
 * Validate and brand a string as a ULID.
 * @throws if the value is not a valid ULID.
 */
export function assertUlid(value: string): Ulid {
  if (!isUlid(value)) {
    throw new Error(`Invalid ULID: "${value}"`);
  }
  return value;
}

/**
 * Brand a string as an Id without validation.
 * Use only for literals known to be valid (fixtures, seeds, tests).
 */
export function unsafeId(value: string): Id {
  return value as Id;
}
