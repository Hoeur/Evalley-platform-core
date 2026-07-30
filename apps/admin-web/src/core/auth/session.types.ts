import type { Permission, Role } from "./permissions";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  permissions: Permission[];
};

export type Session = {
  clientKey: string;
  user: SessionUser;
  expiresAt: string;
};
