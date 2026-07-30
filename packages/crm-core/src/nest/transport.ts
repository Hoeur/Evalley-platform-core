export type CrmRequest = {
  readonly method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  readonly path: string;
  readonly query?: Readonly<
    Record<string, string | number | boolean | undefined>
  >;
  readonly body?: unknown;
};

export type CrmTransport = <T>(request: CrmRequest) => Promise<T>;

export type NestCrmEnvelope<T> = {
  readonly success: true;
  readonly data: T;
  readonly meta: {
    readonly requestId: string;
    readonly timestamp: string;
  };
};

export class CrmApiContractError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CrmApiContractError";
  }
}

export function unwrapCrmData<T>(envelope: NestCrmEnvelope<T>): T {
  if (!envelope || envelope.success !== true || !("data" in envelope)) {
    throw new CrmApiContractError(
      "The CRM API response did not contain a successful data envelope.",
    );
  }
  return envelope.data;
}
