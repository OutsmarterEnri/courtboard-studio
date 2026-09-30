const { test } = require("node:test");
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const { once } = require("node:events");
const path = require("node:path");
const { chromium } = require("playwright");
test(
  "tablet layout, freehand editing, history, local persistence and offline cold load",
  { timeout: 90000 },
  async () => {
    const server = spawn(process.execPath, ["scripts/serve.cjs"], {
      cwd: path.resolve(__dirname, "../.."),
      env: { ...process.env, PORT: "0" },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let browser;
    try {
      const [ready] = await once(server.stdout, "data");
      const url = ready.toString().match(/http:\/\/\S+/)[0];
      browser = await chromium.launch();
      const context = await browser.newContext({
        viewport: { width: 1024, height: 768 },
        hasTouch: true,
      });
      const page = await context.newPage();
      let errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(url);
      await page.waitForFunction(() => hydrated);
      await page.evaluate(() => navigator.serviceWorker.ready);
      await page.waitForFunction(
        () => navigator.serviceWorker.controller !== null,
      );
      async function preset(view, rotation) {
        await page.click("#openSettings");
        await page.selectOption("#view", view);
        await page.selectOption("#rotation", String(rotation));
        await page.click("#closeSettings");
        await page.waitForTimeout(80);
      }
      for (const size of [
        { width: 1024, height: 768 },
        { width: 768, height: 1024 },
        { width: 1366, height: 1024 },
        { width: 390, height: 844 },
      ]) {
        await page.setViewportSize(size);
        for (const view of ["half", "full"])
          for (const angle of [0, 90, 180, 270]) {
            await preset(view, angle);
            const bounds = await page.evaluate(() => {
              const c = document
                  .getElementById("court")
                  .getBoundingClientRect(),
                s = document
                  .getElementById("boardStage")
                  .getBoundingClientRect(),
                f = document.querySelector(".sequence").getBoundingClientRect(),
                b = document
                  .getElementById("boardSurface")
                  .getBoundingClientRect();
              return {
                c: {
                  width: c.width,
                  height: c.height,
                  top: c.top,
                  bottom: c.bottom,
                },
                s: { width: s.width, height: s.height, bottom: s.bottom },
                frameBottom: f.bottom,
                ratio: cv.width / cv.height,
                boxWidth: b.width,
                overflow: document.documentElement.scrollWidth > innerWidth,
              };
            });
            assert.ok(bounds.c.width > 80 && bounds.c.height > 80);
            assert.ok(bounds.c.top >= bounds.frameBottom);
            assert.ok(bounds.c.bottom <= bounds.s.bottom + 1);
            assert.ok(
              Math.abs(bounds.c.width / bounds.c.height - bounds.ratio) < 0.025,
            );
            assert.equal(bounds.boxWidth, bounds.c.width);
            assert.equal(bounds.overflow, false);
          }
      }
      await page.setViewportSize({ width: 1024, height: 768 });
      await preset("half", 90);
      await page.click("[data-tool=pen]");
      const box = await page.locator("#court").boundingBox();
      async function stroke() {
        await page.mouse.move(
          box.x + box.width * 0.4,
          box.y + box.height * 0.6,
        );
        await page.mouse.down();
        await page.mouse.move(
          box.x + box.width * 0.55,
          box.y + box.height * 0.65,
          { steps: 12 },
        );
        await page.mouse.move(
          box.x + box.width * 0.7,
          box.y + box.height * 0.6,
          { steps: 12 },
        );
        await page.mouse.up();
      }
      await stroke();
      assert.equal(
        await page.evaluate(() => current().lines.at(-1).type),
        "pen",
      );
      assert.ok(
        await page.evaluate(() => current().lines.at(-1).points.length > 10),
      );
      await page.click("#undoLine");
      assert.equal(await page.evaluate(() => current().lines.length), 0);
      await page.click("#redo");
      assert.equal(await page.evaluate(() => current().lines.length), 1);
      await page.click("[data-tool=erase]");
      await page.mouse.click(box.x + box.width * 0.4, box.y + box.height * 0.6);
      assert.equal(await page.evaluate(() => current().lines.length), 0);
      await page.click("#undoLine");
      assert.equal(await page.evaluate(() => current().lines.length), 1);
      await page.click("#openSettings");
      await page.locator("#title").fill("Schema offline iPad");
      await page.check("#pencilOnly");
      await page.keyboard.press("Escape");
      assert.equal(
        await page.locator("#settings").evaluate((d) => d.open),
        false,
      );
      await page.click("[data-tool=pen]");
      await stroke();
      assert.equal(
        await page.evaluate(() => current().lines.length),
        1,
        "mouse does not draw in pencil-only mode",
      );
      await page.click("#addFrame");
      await page.waitForFunction(
        () =>
          document.getElementById("saveStatus").textContent ===
          "Salvato sul dispositivo",
      );
      await context.setOffline(true);
      await page.reload();
      await page.waitForFunction(() => hydrated);
      assert.equal(
        await page.locator("#title").inputValue(),
        "Schema offline iPad",
      );
      assert.equal(await page.locator("#rotation").inputValue(), "90");
      assert.equal(await page.evaluate(() => frames.length), 2);
      assert.equal(await page.evaluate(() => frames[0].lines.length), 1);
      assert.equal(await page.locator("#pencilOnly").isChecked(), true);
      assert.deepEqual(errors, []);
    } finally {
      await browser?.close();
      server.kill();
    }
  },
);
