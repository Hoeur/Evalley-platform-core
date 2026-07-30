export type PaginatedResult<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
  pageCount: number;
};

export function parsePositiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function parseEnumValue<T extends string>(
  value: string | undefined,
  supported: readonly T[],
): T | undefined {
  return value && supported.includes(value as T) ? (value as T) : undefined;
}
