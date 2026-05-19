import { expect, test } from "@playwright/test";

test("primary allocator happy path produces an honest fixture receipt", async ({ page }) => {
  await page.goto("/");
  await page.locator('input[aria-label="Ecosystem Grants weight"]').evaluate((element) => {
    const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
    setValue?.call(element, "3800");
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await page.getByRole("button", { name: /simulate allocation/i }).last().click();

  await expect(page.locator("body")).toContainText("Fixture receipt");
  await expect(page.getByText("ecosystem-grants").last()).toBeVisible();
  await expect(page.locator("body")).toContainText("fixture-only-not-deployed");
  await expect(page.getByText("AllocationUpdated", { exact: true })).toBeVisible();
  await expect(page.getByText("Mezo testnet receipt")).toHaveCount(0);
  await expect(page.getByText("Local contract proof")).toHaveCount(0);
});

test("web3 auth fails closed when no injected wallet exists", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "ethereum", {
      configurable: true,
      value: undefined
    });
  });
  await page.goto("/");

  await expect(page.getByText("Wallet unavailable")).toBeVisible();
  await expect(page.locator("body")).toContainText("No injected browser wallet detected");
  await expect(page.getByRole("button", { name: /connect and sign/i })).toBeDisabled();
  await expect(page.getByText("Wallet verified")).toHaveCount(0);
});

test("visible actions either work, navigate to a real target, or expose a disabled reason", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "ethereum", {
      configurable: true,
      value: undefined
    });
  });
  await page.goto("/");

  await page.getByRole("button", { name: /simulate allocation/i }).first().click();
  await expect(page.locator("body")).toContainText("Fixture receipt");

  const faucet = page.getByRole("link", { name: /testnet faucet/i });
  await expect(faucet).toHaveAttribute("href", /^https:\/\/faucet\.test\.mezo\.org\/?$/);

  const disabledButtons = await page.locator("button:disabled").allTextContents();
  expect(disabledButtons).toEqual(["Connect and sign"]);
  await expect(page.locator("body")).toContainText("No injected browser wallet detected");

  const unsafeLinks = await page.locator('a[href="#"], a[href^="javascript:"], a:not([href])').count();
  expect(unsafeLinks).toBe(0);
});

test("Mezo RPC integration returns the expected testnet chain id", async ({ request }) => {
  const response = await request.post("https://rpc.test.mezo.org", {
    data: {
      jsonrpc: "2.0",
      id: 1,
      method: "eth_chainId",
      params: []
    }
  });
  expect(response.ok()).toBe(true);
  expect(await response.json()).toEqual({
    jsonrpc: "2.0",
    id: 1,
    result: "0x7b7b"
  });
});
