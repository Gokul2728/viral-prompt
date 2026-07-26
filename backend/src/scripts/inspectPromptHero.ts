/**
 * Inspect Script - Analyze PromptHero DOM structure
 */

import { chromium } from "playwright";

async function inspectPromptHero() {
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

    // Scroll to load lazy-loaded content
    for (let i = 0; i < 3; i++) {
      await page.evaluate("window.scrollBy(0, window.innerHeight)");
      await page.waitForTimeout(1500);
    }

    // Use page.locator to find elements
    console.log("\n📊 Analyzing page structure...\n");

    // Try to find cards using different selectors
    const selectors = [
      'a[href*="/prompts/"]',
      '[class*="card"]',
      '[class*="prompt"]',
      "article",
      "li",
      ".slds-m-bottom_medium",
      'div[class*="box"]',
      'div[class*="item"]',
    ];

    for (const selector of selectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        console.log(`✓ Found ${count} elements matching: "${selector}"`);

        if (count > 0 && count <= 10) {
          // Get details of first few elements
          for (let i = 0; i < Math.min(3, count); i++) {
            const element = page.locator(selector).nth(i);
            const text = await element.innerText().catch(() => "");
            const href = await element.getAttribute("href").catch(() => "");
            const img = await element
              .locator("img")
              .first()
              .getAttribute("src")
              .catch(() => "");

            console.log(
              `  [${i}] Text: "${text.slice(0, 50)}..." | href: ${href?.slice(0, 40)}... | img: ${img?.slice(0, 40)}...`,
            );
          }
          console.log();
        }
      }
    }

    // Get page title and heading
    const title = await page.title();
    console.log(`\n📄 Page Title: ${title}`);

    const h1 = await page
      .locator("h1")
      .first()
      .innerText()
      .catch(() => "N/A");
    console.log(`📌 Main Heading: ${h1}`);

    // Look for prompt-specific elements
    console.log("\n🎯 Looking for prompt content...\n");

    const promptContent = await page.evaluate(() => {
      const results: any = [];

      // Strategy 1: Look for links containing "/prompts/"
      const links = Array.from(
        document.querySelectorAll("a[href*='/prompts/']"),
      ).slice(0, 5);

      links.forEach((link: any, i: number) => {
        const parent = link.closest("div") || link.parentElement;
        const img = parent?.querySelector("img");
        const text =
          parent?.innerText || parent?.textContent || link.textContent;

        results.push({
          method: "prompt-link",
          index: i,
          href: link.getAttribute("href"),
          text: text?.slice(0, 100) || "",
          image:
            img?.getAttribute("src") || img?.getAttribute("data-src") || "",
        });
      });

      return results;
    });

    console.log("Found prompts:");
    promptContent.forEach((p: any) => {
      console.log(`  [${p.method}] ${p.text?.slice(0, 60)}
    - Link: ${p.href}
    - Image: ${p.image?.slice(0, 50)}...`);
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  inspectPromptHero();
}

export default inspectPromptHero;
