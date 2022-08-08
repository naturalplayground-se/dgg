import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("https://edit.mediaflowpro.com/?key=stxfVjOgQMUb");
});

test.describe("Template", () => {
  test("Dagspress_annons_80x88.pdf should be downloaded", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1304 });
    await page.waitForSelector("#dlbtn2"), await page.click("#dlbtn2");
    await expect(
      page.frameLocator("#dialogiframe").locator("#okbtn")
    ).toBeVisible();

    page.on("dialog", (dialog) => dialog.dismiss());

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.frameLocator("#dialogiframe").locator("#okbtn").click(),
    ]);

    await download.saveAs("downloads/dagspress_annons_80x88.pdf");
  });
});

//Not working with headless:true
//Not working with "trace:on"
