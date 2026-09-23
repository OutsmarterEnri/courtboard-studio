const { test } = require("node:test");
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const { once } = require("node:events");
const fs = require("node:fs/promises");
const path = require("node:path");
const { chromium } = require("playwright");
const geometry = require("../dist/geometry.js");

test(
  "rotated editing, presets, JSON and actual video export",
  { timeout: 90000 },
  async () => {
    const server = spawn(process.execPath, ["scripts/serve.cjs"], {
      cwd: path.resolve(__dirname, ".."),
      env: { ...process.env, PORT: "0" },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let browser;
    try {
      const [ready] = await once(server.stdout, "data");
      const url = ready.toString().match(/http:\/\/\S+/)[0];
      browser = await chromium.launch({ headless: true });
      const page = await browser.newPage({
        viewport: { width: 1440, height: 1100 },
      });
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(url);
      await page.locator("#title").fill("Pick & roll — rotazione");
      for (const view of ["full", "half"]) {
        await page.selectOption("#view", view);
        for (const angle of [0, 90, 180, 270]) {
          await page.selectOption("#rotation", String(angle));
          const width = view === "full" ? 1500 : 800;
          const expectedSize = geometry.dimensions(width, 850, angle);
          const actualSize = await page.evaluate(() => ({
            width: cv.width,
            height: cv.height,
          }));
          assert.deepEqual(actualSize, expectedSize);
          await page.selectOption("#selected", "a0");
          const before = await page.evaluate(() => ({
            ...current().items.find((o) => o.id === "a0"),
          }));
          await page.locator("#court").focus();
          await page.keyboard.press("ArrowRight");
          const after = await page.evaluate(() => ({
            ...current().items.find((o) => o.id === "a0"),
          }));
          const a = geometry.toScreen(before, width, 850, angle);
          const b = geometry.toScreen(after, width, 850, angle);
          assert.equal(b.x - a.x, 5);
          assert.equal(b.y - a.y, 0);
          const box = await page.locator("#court").boundingBox();
          const target = { x: after.x - 18, y: after.y + 12 };
          const end = geometry.toScreen(target, width, 850, angle);
          const screen = (p) => ({
            x: box.x + (p.x / expectedSize.width) * box.width,
            y: box.y + (p.y / expectedSize.height) * box.height,
          });
          const start = screen(b),
            finish = screen(end);
          await page.mouse.move(start.x, start.y);
          await page.mouse.down();
          await page.mouse.move(finish.x, finish.y, { steps: 4 });
          await page.mouse.up();
          const dragged = await page.evaluate(() =>
            current().items.find((o) => o.id === "a0"),
          );
          assert.ok(
            Math.abs(dragged.x - target.x) < 1,
            "drag x follows inverse rotation",
          );
          assert.ok(
            Math.abs(dragged.y - target.y) < 1,
            "drag y follows inverse rotation",
          );
        }
      }
      await page.selectOption("#teams", "attack");
      assert.equal(await page.locator("#selected option").count(), 6);
      await page.click("#cone");
      await page.click("#addFrame");
      await page.selectOption("#selected", "a0");
      await page.locator("#court").focus();
      await page.keyboard.press("ArrowRight");
      const interpolation = await page.evaluate(() => ({
        actual: at(3).items[0],
        a: frames[0].items[0],
        b: frames[1].items[0],
      }));
      assert.equal(
        interpolation.actual.x,
        (interpolation.a.x + interpolation.b.x) / 2,
      );
      assert.equal(
        interpolation.actual.y,
        (interpolation.a.y + interpolation.b.y) / 2,
      );
      const saving = page.waitForEvent("download");
      await page.click("#save");
      const saved = await saving;
      const jsonPath = await saved.path();
      const json = JSON.parse(await fs.readFile(jsonPath, "utf8"));
      assert.deepEqual(json.presets, {
        teams: "attack",
        view: "half",
        rotation: 270,
      });
      await page.selectOption("#rotation", "0");
      await page.locator("#file").setInputFiles(jsonPath);
      await page.waitForFunction(
        () =>
          document.getElementById("status").textContent === "Schema caricato.",
      );
      assert.equal(await page.locator("#rotation").inputValue(), "270");
      await page.click("#rotate");
      assert.equal(await page.locator("#rotation").inputValue(), "0");
      await page.selectOption("#rotation", "90");
      const exporting = page.waitForEvent("download");
      await page.click("#export");
      const video = await exporting;
      const bytes = await fs.readFile(await video.path());
      assert.ok(bytes.length > 1000);
      const metadata = await page.evaluate(
        async ({ bytes, type }) => {
          const video = document.createElement("video");
          video.src = URL.createObjectURL(
            new Blob([new Uint8Array(bytes)], { type }),
          );
          return new Promise((resolve, reject) => {
            video.onloadedmetadata = () => {
              resolve({ width: video.videoWidth, height: video.videoHeight });
              URL.revokeObjectURL(video.src);
            };
            video.onerror = () =>
              reject(new Error("Exported video cannot be decoded"));
          });
        },
        {
          bytes: [...bytes],
          type: video.suggestedFilename().endsWith(".mp4")
            ? "video/mp4"
            : "video/webm",
        },
      );
      assert.deepEqual(metadata, { width: 850, height: 800 });
      await page.selectOption("#teams", "both");
      assert.equal(await page.locator("#selected option").count(), 12);
      await page.setViewportSize({ width: 390, height: 844 });
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
      );
      assert.deepEqual(errors, []);
    } finally {
      await browser?.close();
      server.kill();
    }
  },
);
