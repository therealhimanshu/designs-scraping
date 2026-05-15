import re
import asyncio
import pandas as pd
from crawl4ai import AsyncWebCrawler
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse

# ========================
# CONFIG
# ========================
BASE_URL = "https://www.zara.com/uk/en/woman-new-in-l1180.html?v1=2546081&page=1"
MAX_PAGES = 1
DELAY_BETWEEN_LIST_PAGES = 2
OUTPUT_CSV = "zara_products.csv"

INVALID_URL = "https://www.zara.com/uk/en/-p.html"


class ZaraScraper:
    def __init__(self, base_url):
        self.base_url = base_url
        self.all_product_urls = set()

    # -----------------------
    # PAGINATION
    # -----------------------
    def modify_page_number(self, url, page):
        parsed = urlparse(url)
        qs = parse_qs(parsed.query)
        qs["page"] = [str(page)]
        return urlunparse(parsed._replace(query=urlencode(qs, doseq=True)))

    # -----------------------
    # LISTING EXTRACTION
    # -----------------------
    def extract_product_urls(self, text):
        urls = re.findall(
            r"https://www\.zara\.com/uk/en/[^)\s\"']*?-p\d+\.html[^)\s\"']*",
            text,
            re.IGNORECASE,
        )
        return list(set(urls))

    async def crawl_listing_page(self, crawler, url, page):
        print(f"[listing] Page {page}")

        result = await crawler.arun(
            url=url,
            bypass_cache=True,
            delay_before_return_html=2,
        )

        if not result.success:
            return []

        return self.extract_product_urls(result.markdown or "")

    async def collect_product_urls(self):
        async with AsyncWebCrawler(verbose=True) as crawler:
            empty = 0

            for page in range(1, MAX_PAGES + 1):
                if empty >= 3:
                    break

                url = self.modify_page_number(self.base_url, page)
                found = await self.crawl_listing_page(crawler, url, page)

                if found:
                    new = set(found) - self.all_product_urls
                    self.all_product_urls.update(new)
                    empty = 0
                    print(f"[listing] +{len(new)} new")
                else:
                    empty += 1

                await asyncio.sleep(DELAY_BETWEEN_LIST_PAGES)

        print(f"\nCollected {len(self.all_product_urls)} product URLs\n")
        return list(self.all_product_urls)

    # -----------------------
    # PRODUCT PAGE HANDLER
    # -----------------------
    async def click_and_scroll(self, page):
        try:
            await page.wait_for_selector("button[data-testid='truste-consent-button']", timeout=5000)
            await page.click("button[data-testid='truste-consent-button']")
        except:
            pass

        for _ in range(5):
            await page.mouse.wheel(0, 3000)
            await page.wait_for_timeout(1000)

        return await page.content()

    # -----------------------
    # PRODUCT PARSER
    # -----------------------
    def extract_product_details(self, md, url):
        name = re.search(r"#\s*(.+)", md)
        price = re.search(r"(\d+\.\d{2})\s*GBP", md)
        image = re.search(r"!\[.*?\]\((.*?)\)", md)
        sku = re.search(r"p(\d+)\.html", url)

        return {
            "name": name.group(1).strip() if name else "N/A",
            "sku": sku.group(1) if sku else "N/A",
            "url": url,
            "image": image.group(1) if image else "N/A",
            "price": price.group(0) if price else "N/A",
            "availability": "out_of_stock" if "OUT OF STOCK" in md.upper() else "in_stock",
        }

    # -----------------------
    # SCRAPER
    # -----------------------
    async def scrape_products(self, urls):
        rows = []

        async with AsyncWebCrawler() as crawler:
            for url in urls:
                if url == INVALID_URL:
                    continue

                print(f"[product] {url}")

                try:
                    result = await crawler.arun(url=url, handler=self.click_and_scroll)
                    rows.append(self.extract_product_details(result.markdown or "", url))
                except Exception as e:
                    print("Error:", e)

        return pd.DataFrame(rows)


# ========================
# MAIN
# ========================
async def main():
    scraper = ZaraScraper(BASE_URL)

    # 1️⃣ Collect URLs
    urls = await scraper.collect_product_urls()

    # 2️⃣ Scrape products
    df = await scraper.scrape_products(urls)

    # 3️⃣ Save CSV
    df.to_csv(OUTPUT_CSV, index=False)
    print(f"\nSaved {len(df)} products → {OUTPUT_CSV}")


if __name__ == "__main__":
    asyncio.run(main())
