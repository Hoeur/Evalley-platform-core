import { ApplicationError } from "./application-error";
export class UnauthorizedError extends ApplicationError {
  constructor(message = "Authentication required") {
    super(message, "UNAUTHORIZED", 401);
  }
}
