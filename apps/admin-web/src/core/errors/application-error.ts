export class ApplicationError extends Error {
  constructor(
    message: string,
    readonly code = "APPLICATION_ERROR",
    readonly status = 500,
  ) {
    super(message);
    this.name = "ApplicationError";
  }
}
