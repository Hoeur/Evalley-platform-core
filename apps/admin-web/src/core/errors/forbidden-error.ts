import { ApplicationError } from "./application-error";
export class ForbiddenError extends ApplicationError {
  constructor(message = "Permission denied") {
    super(message, "FORBIDDEN", 403);
  }
}
