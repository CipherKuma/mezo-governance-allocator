import fs from "node:fs";
import path from "node:path";

const viewports = [
  { name: "mobile-375", width: 375, height: 812 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "desktop-1440", width: 1440, height: 900 }
];

export async function run({ page }) {
  const url = process.env.LOCAL_VISUAL_QA_URL ?? "http://localhost:5180/";
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outDir = process.env.LOCAL_VISUAL_QA_DIR ?? path.join(process.cwd(), "outputs", "visual-qa", stamp);

  fs.mkdirSync(outDir, { recursive: true });

  const results = [];
  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto(url, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: /simulate allocation/i }).first().click();
    await page.waitForTimeout(900);

    const screenshot = path.join(outDir, `${viewport.name}.png`);
    await page.screenshot({ path: screenshot, fullPage: true });

    const measurements = await page.evaluate(() => {
      const root = document.documentElement;
      const receiptText = document.body.innerText;
      const hero = document.querySelector("h1")?.getBoundingClientRect();
      const receipt = Array.from(document.querySelectorAll("aside")).at(-1)?.getBoundingClientRect();
      return {
        horizontalOverflow: root.scrollWidth > window.innerWidth + 1,
        scrollWidth: root.scrollWidth,
        innerWidth: window.innerWidth,
        hasFixtureReceipt: receiptText.includes("Fixture receipt"),
        hasFakeLocalProof: receiptText.includes("Local contract proof"),
        hasLiveReceipt: receiptText.includes("Mezo testnet receipt"),
        hasFixtureContractLabel: receiptText.includes("fixture-only-not-deployed"),
        hasWalletUnavailableState: receiptText.includes("Wallet unavailable"),
        hasWalletVerifiedState: receiptText.includes("Wallet verified"),
        heroVisible: Boolean(hero && hero.width > 0 && hero.height > 0),
        receiptVisible: Boolean(receipt && receipt.width > 0 && receipt.height > 0)
      };
    });

    results.push({ viewport, screenshot, measurements });
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  await page.locator('input[aria-label="Ecosystem Grants weight"]').evaluate((element) => {
    const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
    setValue?.call(element, "3800");
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await page.getByRole("button", { name: /simulate allocation/i }).last().click();
  await page.waitForFunction(() => document.body.innerText.includes("ecosystem-grants"));
  await page.waitForTimeout(300);

  const flowScreenshot = path.join(outDir, "primary-flow-after-simulate.png");
  await page.screenshot({ path: flowScreenshot, fullPage: true });

  const flow = await page.evaluate(() => {
    const text = document.body.innerText;
    return {
      fixtureReceiptVisible: text.includes("Fixture receipt"),
      fixtureHashVisible: text.includes("fixture-"),
      fixtureContractLabelVisible: text.includes("fixture-only-not-deployed"),
      leadingGaugeChanged: text.includes("ecosystem-grants"),
      localContractProofVisible: text.includes("Local contract proof"),
      liveTestnetReceiptVisible: text.includes("Mezo testnet receipt"),
      walletUnavailableVisible: text.includes("Wallet unavailable"),
      walletVerifiedVisible: text.includes("Wallet verified"),
      eventVisible: text.includes("AllocationUpdated")
    };
  });

  const summary = { url, outDir, results, primaryFlow: { screenshot: flowScreenshot, ...flow } };
  fs.writeFileSync(path.join(outDir, "summary.json"), `${JSON.stringify(summary, null, 2)}\n`);
  console.log(JSON.stringify(summary, null, 2));
}
