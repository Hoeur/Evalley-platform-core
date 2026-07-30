import { expect, test } from "@playwright/test";

const clientKey = process.env.CLIENT_KEY ?? "evalley";
const email =
  process.env.E2E_ADMIN_EMAIL ??
  (clientKey === "evalley" ? "admin@example.com" : `admin@${clientKey}.local`);
const password = process.env.E2E_ADMIN_PASSWORD ?? "password";

async function signIn(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

test("requires login and rejects invalid credentials", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login$/);
  await page.getByLabel("Email address").fill("invalid@example.com");
  await page.getByLabel("Password").fill("wrong-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(
    page.getByText(
      /Invalid email or password|provided credentials are incorrect/i,
    ),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
});

test("login and dashboard render", async ({ page }) => {
  await signIn(page);
  await expect(page.getByText(/Welcome back/)).toBeVisible();
});

test("navigation and products URL filters work", async ({ page }) => {
  test.skip(
    clientKey !== "evalley",
    "Real commerce integration is Evalley-only.",
  );
  await signIn(page);
  await page.getByRole("link", { name: "Products" }).first().click();
  await expect(page).toHaveURL(/\/products/);
  await page.getByPlaceholder("Search product name or SKU...").fill("watch");
  await expect(page).toHaveURL(/q=watch/);
  await page.getByLabel("Filter by inventory").click();
  await page.getByRole("option", { name: "Low stock" }).click();
  await expect(page).toHaveURL(/stock=low-stock/);
});

test("logout clears the client session", async ({ page }) => {
  await signIn(page);
  await page.getByRole("button", { name: "Open user menu" }).click();
  await page.getByRole("menuitem", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login$/);
});

test("product create and update use the ecommerce API", async ({ page }) => {
  test.skip(
    clientKey !== "evalley",
    "Real commerce integration is Evalley-only.",
  );
  test.setTimeout(60_000);
  await signIn(page);

  const suffix = Date.now();
  const sku = `E2E-PRODUCT-${suffix}`;
  const initialName = `E2E Product ${suffix}`;
  const updatedName = `E2E Product Updated ${suffix}`;

  try {
    await page.goto("/products/new");
    await page.locator('input[name="name"]').fill(initialName);
    await page.locator('input[name="sku"]').fill(sku);
    await page.locator('input[name="price"]').fill("12.25");
    await page.locator('input[name="stock"]').fill("4");
    await page.getByRole("button", { name: "Create product" }).click();

    await expect(page).toHaveURL(/\/products\/\d+$/, { timeout: 20_000 });
    await expect(
      page.getByRole("heading", { name: initialName }),
    ).toBeVisible();
    await expect(page.getByText("4 units")).toBeVisible();

    await page.getByRole("link", { name: "Edit product" }).click();
    await page.locator('input[name="name"]').fill(updatedName);
    await page.locator('input[name="price"]').fill("19.50");
    await page.locator('input[name="stock"]').fill("8");
    await page.getByRole("combobox").last().click();
    await page.getByRole("option", { name: "Published" }).click();
    await page.getByRole("button", { name: "Save changes" }).click();

    await expect(page).toHaveURL(/\/products\/\d+$/, { timeout: 20_000 });
    await expect(
      page.getByRole("heading", { name: updatedName }),
    ).toBeVisible();
    await expect(page.getByText("$19.50")).toBeVisible();
    await expect(page.getByText("8 units")).toBeVisible();

    await page.goto(`/products?q=${encodeURIComponent(sku)}`);
    await expect(page.getByText(sku)).toBeVisible();
    await page.getByLabel("Filter by status").click();
    await page.getByRole("option", { name: "Active", exact: true }).click();
    await expect(page).toHaveURL(/status=active/);
    await expect(page.getByText(sku)).toBeVisible();
    await page.getByLabel("Filter by inventory").click();
    await page.getByRole("option", { name: "In stock" }).click();
    await expect(page).toHaveURL(/stock=in-stock/);
    await expect(page.getByText(sku)).toBeVisible();
    await page.getByLabel("Sort products").click();
    await page.getByRole("option", { name: "Lowest stock" }).click();
    await expect(page).toHaveURL(/sort=stock.asc/);
    await expect(page.getByText(sku)).toBeVisible();
  } finally {
    await page.goto(`/products?q=${encodeURIComponent(sku)}`);
    const updatedActions = page.getByRole("button", {
      name: `Actions for ${updatedName}`,
    });
    const initialActions = page.getByRole("button", {
      name: `Actions for ${initialName}`,
    });
    const actions =
      (await updatedActions.count()) > 0 ? updatedActions : initialActions;
    if (await actions.isVisible().catch(() => false)) {
      await actions.click();
      await page.getByRole("menuitem", { name: "Delete" }).click();
      await page.getByRole("button", { name: "Delete" }).click();
      await expect(page.getByText(sku)).not.toBeVisible();
    }
  }
});
