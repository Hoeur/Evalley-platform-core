import { describe, expect, it } from "vitest";
import { clientPublicConfigSchema } from "./client.schema";
import { clientRegistry, getRegisteredClient } from "./client-registry";
describe("client registry", () => {
  it("validates all registered public clients", () => {
    Object.values(clientRegistry).forEach((client) =>
      expect(clientPublicConfigSchema.safeParse(client.public).success).toBe(
        true,
      ),
    );
  });

  it("keeps defaults inside each client's licensed modules", () => {
    Object.values(clientRegistry).forEach((client) => {
      expect(
        client.public.modules.every((module) =>
          client.public.availableModules.includes(module),
        ),
      ).toBe(true);
    });
  });

  it("selects authentication per client", () => {
    expect(clientRegistry.evalley.server.auth.adapter).toBe("ecommerce-api");
    expect(clientRegistry.default.server.auth.adapter).toBe("mock");
    expect(clientRegistry.grocery.server.auth.adapter).toBe("mock");
    expect(clientRegistry.renthouse.server.auth.adapter).toBe("mock");
  });

  it("fails clearly for unknown clients", () => {
    expect(() => getRegisteredClient("missing")).toThrow(/Unknown CLIENT_KEY/);
  });
});
