# E-commerce Designs Scraping

A comprehensive collection of web scraping tools for extracting product data from fashion and design e-commerce platforms. This repository contains multiple scraper implementations using both Python and Google Apps Script, each tailored to different target websites.

## 📋 Overview

This project provides robust scraping solutions for:
- **Zara** - Async Python-based web scraper
- **Savana** - Google Apps Script using sitemap extraction
- **Cider** - Google Apps Script with dynamic HTML parsing

Each scraper is designed to handle the specific DOM structures and requirements of their target websites, with error handling, deduplication, and CSV/Sheets export functionality.

---

## 🔧 Project Sections

### 1. **Zara Scraper** (`zara-scraping.py`)

A high-performance asynchronous Python scraper for Zara's UK fashion catalog.

#### Features:
- ✅ Async/await pattern for concurrent requests
- ✅ Intelligent pagination handling
- ✅ Dynamic JavaScript rendering support
- ✅ Consent button automation
- ✅ Product detail extraction (name, price, SKU, image, availability)
- ✅ CSV export functionality
- ✅ Configurable delays between requests

#### Tech Stack:
- `asyncio` - Asynchronous I/O
- `crawl4ai` - Web crawling with JavaScript support
- `pandas` - Data manipulation and CSV export
- `re` - Regular expression parsing
- `urllib.parse` - URL manipulation

#### Configuration:
```python
BASE_URL = "https://www.zara.com/uk/en/woman-new-in-l1180.html?v1=2546081&page=1"
MAX_PAGES = 1
DELAY_BETWEEN_LIST_PAGES = 2
OUTPUT_CSV = "zara_products.csv"
```

#### Output Format:
```
| name | sku | url | image | price | availability |
|------|-----|-----|-------|-------|----------------|
| Product Name | 12345 | https://... | https://... | 79.95 GBP | in_stock |
```

#### Usage:
```bash
pip install crawl4ai pandas
python zara-scraping.py
```

---

### 2. **Savana Scraper** (`savana-designs-scraping`)

Google Apps Script for scraping Savana product data directly into Google Sheets via sitemap.

#### Features:
- ✅ Sitemap-based URL discovery
- ✅ Automatic deduplication via Google Sheets
- ✅ JSON script tag parsing
- ✅ Direct Google Sheets integration
- ✅ Daily date tracking
- ✅ Error logging and retry logic

#### Tech Stack:
- Google Apps Script
- UrlFetchApp - HTTP requests
- SpreadsheetApp - Google Sheets integration
- Regular expressions for HTML parsing

#### Data Fields Extracted:
- `Date` - Date of scrape
- `URL` - Product page URL
- `Goods ID` - Internal product ID
- `Name` - Product name
- `Price` - Product price
- `Discount` - Discount value
- `Stock Status` - Button name (availability indicator)
- `Image Thumbnail` - Product image URL

#### Setup:
1. Open Google Apps Script in Google Sheets
2. Copy the entire `savana-designs-scraping` code
3. Run `fetchAndScrapeSavana()` function
4. Authorize necessary permissions

#### Scheduling:
To run automatically daily, use Google Apps Script triggers.

---

### 3. **Cider Scraper** (`cider-scraping.gs`)

Google Apps Script for scraping Cider shop products with comprehensive HTML parsing.

#### Features:
- ✅ Sitemap-based product discovery
- ✅ Duplicate URL detection
- ✅ Multi-pattern price extraction (price-origin, price-main fallback)
- ✅ Discount tag detection
- ✅ Button state extraction (availability)
- ✅ Image URL parsing (multiple fallback patterns)
- ✅ User-Agent rotation for better success rates
- ✅ Direct Google Sheets export

#### Tech Stack:
- Google Apps Script
- UrlFetchApp - HTTP requests with User-Agent headers
- SpreadsheetApp - Google Sheets integration
- Complex regex patterns for DOM parsing

#### Data Fields Extracted:
- `Date` - Scrape date
- `URL` - Product URL
- `Name` - Product name
- `Price` - Product price
- `Discount` - Discount percentage/tag
- `Button Text` - Button state (e.g., "Add to Cart", "Out of Stock")
- `Image URL` - Product image

#### Configuration:
```javascript
var url = "https://www.shopcider.com/sitemap_product_1.xml";
var regex = /<loc>(https:\/\/www\.shopcider\.com\/goods\/[^<]+)<\/loc>/g;
newUrls.slice(0, 200).forEach(...)  // Limit to first 200 new products
```

#### Setup:
1. Create a Google Sheet with column headers:
   - Date | URL | Name | Price | Discount | Button Text | Image URL
2. Open Google Apps Script
3. Paste the `cider-scraping.gs` code
4. Run `fetchAndScrapeCider()`
5. Grant required permissions

#### Scheduling:
Create a time-based trigger in Apps Script to run daily/hourly:
```javascript
// In Google Apps Script Triggers menu
// Set up: "Run fetchAndScrapeCider" every day at a specific time
```

---

## 📦 Dependencies

### Python (Zara):
```
crawl4ai>=0.3.0
pandas>=1.3.0
```

### Google Apps Script (Savana & Cider):
- Built-in: `UrlFetchApp`, `SpreadsheetApp`, `Utilities`
- No external dependencies required

---

## 🚀 Installation & Setup

### Zara Scraper (Python)

```bash
# Clone the repository
git clone https://github.com/therealhimanshu/designs-scraping.git
cd designs-scraping

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the scraper
python zara-scraping.py
```

### Savana & Cider Scrapers (Google Apps Script)

1. **Open Google Sheets** - Create a new spreadsheet or use an existing one
2. **Open Apps Script** - Tools → <> Script Editor
3. **Copy the code** - Paste the entire script from `savana-designs-scraping` or `cider-scraping.gs`
4. **Set up headers** in your sheet:
   ```
   Date | URL | Name | Price | Discount | Stock/Button | Image
   ```
5. **Run** - Click the play button or select function to execute
6. **Authorize** - Grant necessary permissions when prompted
7. **Schedule** (optional) - Set up automatic triggers in Triggers panel

---

## 📊 Output Formats

### Zara Output (CSV)
```csv
name,sku,url,image,price,availability
Striped Shirt,2546081,https://www.zara.com/...,https://image.url,79.95 GBP,in_stock
```

### Savana Output (Google Sheets)
| Date | URL | Goods ID | Name | Price | Discount | Stock | Image |
|------|-----|----------|------|-------|----------|-------|-------|
| 2026-05-15 | https://www.savana.com/details/... | 12345 | Product | 99.99 | 20% | Add to Cart | https://... |

### Cider Output (Google Sheets)
| Date | URL | Name | Price | Discount | Button Text | Image URL |
|------|-----|------|-------|----------|------------|-----------|
| 2026-05-15 | https://www.shopcider.com/goods/... | Cool Design | $29.99 | 30% OFF | Add to Cart | https://... |

---

## ⚠️ Important Disclaimers

### Legal & Ethical Considerations

1. **Terms of Service** - Always review and respect each website's Terms of Service
2. **Robots.txt** - Check and follow robots.txt guidelines for each domain
3. **Rate Limiting** - Use appropriate delays between requests to avoid server overload
4. **Copyright** - Product images and descriptions are owned by their respective companies
5. **User-Agent** - These scripts identify themselves with appropriate User-Agent headers
6. **Data Usage** - Only use scraped data for legitimate, non-competitive purposes
7. **Legal Compliance** - Ensure compliance with GDPR, CCPA, and other data privacy regulations

### Best Practices

- ✅ Use appropriate delays between requests (2+ seconds recommended)
- ✅ Monitor your scraping activity to avoid blocking
- ✅ Respect dynamic rate limits if implemented
- ✅ Consider official APIs first before scraping
- ✅ Keep scraped data fresh with regular updates
- ✅ Rotate User-Agent headers if scraping at scale

---

## 🔍 Troubleshooting

### Zara Scraper
- **No products found?** Check if URL structure has changed or if page requires authentication
- **Timeout errors?** Increase `DELAY_BETWEEN_LIST_PAGES` value
- **Empty CSV?** Verify regex patterns match current HTML structure

### Google Apps Script Scrapers
- **Permission errors?** Authorize the script in the Apps Script editor
- **No data appended?** Check if column indices match your sheet layout
- **Execution timeouts?** Google Apps Script has a 6-minute execution limit; reduce product limit
- **Blocked by site?** Add delays or check if site blocks automated requests

---

## 📝 License

This project is licensed under the **MIT License** - see [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Areas for Contribution:
- Additional e-commerce platform scrapers
- Improved error handling and logging
- Performance optimizations
- Documentation improvements
- Bug fixes and issue resolution

---

## 📧 Contact & Support

For questions, issues, or suggestions:
- Open an [GitHub Issue](https://github.com/therealhimanshu/designs-scraping/issues)
- Check existing documentation and troubleshooting guides
- Review code comments for implementation details

---

## 🎯 Roadmap

- [ ] Add proxy rotation support
- [ ] Implement browser fingerprint evasion
- [ ] Create unified CLI interface
- [ ] Add database export option (MongoDB, PostgreSQL)
- [ ] Build web dashboard for monitoring
- [ ] Add support for additional platforms (H&M, ASOS, Shein)
- [ ] Implement headless browser integration

---

**Last Updated:** May 15, 2026  
**Repository:** [therealhimanshu/designs-scraping](https://github.com/therealhimanshu/designs-scraping)
