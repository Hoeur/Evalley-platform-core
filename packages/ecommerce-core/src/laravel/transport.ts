export type EcommerceRequest = {
  readonly method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  readonly path: string;
  readonly query?: Readonly<
    Record<string, string | number | boolean | undefined>
  >;
  readonly body?: unknown;
};

export type EcommerceTransport = <T>(request: EcommerceRequest) => Promise<T>;

export class EcommerceApiContractError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EcommerceApiContractError";
  }
}

type LaravelMeta = {
  readonly current_page: number;
  readonly per_page: number;
  readonly total: number;
  readonly last_page: number;
};

export type LaravelEnvelope<T> = {
  readonly status: number;
  readonly status_description: string;
  readonly error_code: string;
  readonly error_message: string;
  readonly error_fields: Readonly<Record<string, readonly string[]>>;
  readonly data: {
    readonly item: T | null;
    readonly items: readonly T[] | null;
    readonly meta: LaravelMeta | null;
  };
};

export function unwrapItem<T>(envelope: LaravelEnvelope<T>): T {
  if (!envelope.data || envelope.data.item === null) {
    throw new EcommerceApiContractError(
      "The commerce API response did not contain data.item.",
    );
  }
  return envelope.data.item;
}

export function unwrapItems<T>(envelope: LaravelEnvelope<T>) {
  if (!envelope.data || !Array.isArray(envelope.data.items)) {
    throw new EcommerceApiContractError(
      "The commerce API response did not contain data.items.",
    );
  }
  const meta = envelope.data.meta;
  return {
    items: envelope.data.items,
    page: meta?.current_page ?? 1,
    perPage: meta?.per_page ?? envelope.data.items.length,
    total: meta?.total ?? envelope.data.items.length,
    lastPage: meta?.last_page ?? 1,
  };
}
