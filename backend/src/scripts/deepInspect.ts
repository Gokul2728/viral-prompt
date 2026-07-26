/**
 * Deep Inspect Script - Get detailed HTML structure
 */

import { chromium } from "playwright";
import * as fs from "fs";

async function deepInspect() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  });

  try {
    console.log("🔍 Navigating to PromptHero ChatGPT Image page...\n");

    await page.goto("https://prompthero.com/chatgpt-image-prompts", {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    await page.waitForTimeout(2000);

    // Scroll to load content
    for (let i = 0; i < 2; i++) {
      await page.evaluate("window.scrollBy(0, window.innerHeight)");
      await page.waitForTimeout(1000);
    }

    console.log("✓ Page loaded\n");

    // Get the first few LI elements' HTML
    const liElements = await page.evaluate(() => {
      const elements = document.querySelectorAll("li");
      const results: any[] = [];

      console.log(`Total LI elements: ${elements.length}`);

      for (let i = 0; i < Math.min(3, elements.length); i++) {
        const el = elements[i];
        results.push({
          index: i,
          outerHTML: el.outerHTML.slice(0, 500),
          innerHTML: el.innerHTML.slice(0, 500),
          innerText: el.innerText?.slice(0, 200),
          className: el.className,
          id: el.id,
          tagName: el.tagName,
        });
      }

      return results;
    });

    console.log("\n📝 Sample LI Elements:");
    liElements.forEach((el: any) => {
      console.log(`\n[${el.index}] <${el.tagName} class="${el.className}">`);
      console.log(`InnerText: ${el.innerText}`);
      console.log(`HTML (first 200 chars): ${el.outerHTML.slice(0, 200)}...`);
    });

    // Get page HTML to file for manual inspection
    const pageContent = await page.content();
    const outputPath = process.cwd() + "/prompthero-page.html";
    fs.writeFileSync(outputPath, pageContent.slice(0, 100000));
    console.log(`✓ Saved HTML snapshot to ${outputPath}\n`);

    // Try alternative selectors
    const selectors = [
      "a[href*='/prompts/']",
      ".box",
      ".list-item",
      "[data-qa*='card']",
      "[data-qa*='prompt']",
      "div > a > img",
    ];

    console.log("\n🎯 Testing alternative selectors:\n");
    for (const sel of selectors) {
      const count = await page.locator(sel).count();
      console.log(`Count for "${sel}": ${count}`);

      if (count > 0 && count < 30) {
        const firstText = await page
          .locator(sel)
          .first()
          .textContent()
          .catch(() => "");
        const firstHtml = await page
          .locator(sel)
          .first()
          .evaluate((el: any) => el.outerHTML?.slice(0, 250))
          .catch(() => "");
        console.log(`  First: "${firstText?.slice(0, 50)}..."`);
      }
      console.log();
    }

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  deepInspect();
}

export default deepInspect;
