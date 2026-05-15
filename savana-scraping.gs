function fetchAndScrapeSavana() {
  var url = "https://www.savana.com/sitemap.in.xml.gz"; // sitemap
  var response = UrlFetchApp.fetch(url);
  var text = response.getContentText();

  // Regex to capture <loc>...</loc>
  var regex = /<loc>(https:\/\/www\.savana\.com\/details\/[^<]+)<\/loc>/g;
  var match;
  var allUrls = [];

  while ((match = regex.exec(text)) !== null) {
    allUrls.push(match[1]);
  }

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues(); // existing sheet data
  var existingUrls = new Set();

  // collect existing URLs (column B = URL)
  for (var i = 1; i < data.length; i++) {
    existingUrls.add(data[i][1]);
  }

  var today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
  var newCount = 0;

  // filter new ones only
  var newUrls = allUrls.filter(function(u) {
    return !existingUrls.has(u);
  });

  // take only 200 fresh ones
  newUrls.slice(0, 20).forEach(function(productUrl) {
    var details = scrapeSavanaProduct(productUrl);
    if (details) {
      sheet.appendRow([
        today,
        productUrl,
        details.goodsId,
        details.name,
        details.price,
        details.discount,
        details.stock,
        details.picThumb
      ]);
      newCount++;
    }
  });

  Logger.log("Added " + newCount + " new products. Found " + newUrls.length + " unseen in total.");
}

/**
 * Scrape product details from a given product page URL
 */
function scrapeSavanaProduct(productUrl) {
  try {
    var response = UrlFetchApp.fetch(productUrl);
    var html = response.getContentText();

    // Find script tag containing "goodsId"
    var scriptRegex = /<script[^>]*>([\s\S]*?goodsId[\s\S]*?)<\/script>/i;
    var scriptMatch = html.match(scriptRegex);

    if (!scriptMatch) return null;

    var scriptContent = scriptMatch[1];

    // Extract JSON-like blob inside script
    var goodsId = (scriptContent.match(/"saleSkuId"\s*:\s*(\d+)/) || [])[1];
    var name = (scriptContent.match(/"goodsName"\s*:\s*"([^"]+)"/) || [])[1];
    var price = (scriptContent.match(/"salesPrice"\s*:\s*(\d+)/) || [])[1];
    var discount = (scriptContent.match(/"discountValue"\s*:\s*(\d+)/) || [])[1];
    var stock = (scriptContent.match(/"buttonName"\s*:\s*"([^"]+)"/) || [])[1];
    var picThumb = (scriptContent.match(/"picThumb"\s*:\s*"([^"]+)"/) || [])[1];

    return {
      goodsId: goodsId || "",
      name: name || "",
      price: price || "",
      discount: discount || "",
      stock: stock || "",
      picThumb: picThumb || ""
    };
  } catch (e) {
    Logger.log("Error scraping " + productUrl + ": " + e);
    return null;
  }
}
