function fetchAndScrapeCider() {
  var url = "https://www.shopcider.com/sitemap_product_1.xml"; // example sitemap for Cider
  var response = UrlFetchApp.fetch(url);
  var text = response.getContentText();

  // Regex to capture product URLs from sitemap (adjust if sitemap structure differs)
  var regex = /<loc>(https:\/\/www\.shopcider\.com\/goods\/[^<]+)<\/loc>/g;
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

  // take only first 20 fresh ones
  newUrls.slice(0, 200).forEach(function(productUrl) {
    var details = scrapeCiderProduct(productUrl);
    if (details) {
      sheet.appendRow([
        today,
        productUrl,
        details.name,
        details.price,
        details.discount,
        details.buttonText,
        details.imageUrl
      ]);
      newCount++;
    }
  });

  Logger.log("Added " + newCount + " new products. Found " + newUrls.length + " unseen in total.");
}

/**
 * Scrape product details from a ShopCider product page
 */
function scrapeCiderProduct(productUrl) {
  try {
    var response = UrlFetchApp.fetch(productUrl, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    var html = response.getContentText();

    // Extract product name
    var nameMatch = html.match(/<div[^>]*class="product-detail-title"[^>]*>([\s\S]*?)<\/div>/i);
    var name = nameMatch ? nameMatch[1].replace(/<[^>]+>/g, "").trim() : "";

    // Extract price
    var originMatch = html.match(/<span[^>]*class="[^"]*\bprice-origin\b[^"]*"[^>]*>([\s\S]*?)<\/span>/i);
    var price = originMatch ? originMatch[1].replace(/<[^>]+>/g, "").trim() : "";
    if (!price) {
      var originMatch = html.match(/<span[^>]*class="[^"]*\bprice-main\b[^"]*"[^>]*>([\s\S]*?)<\/span>/i);
      price = originMatch ? originMatch[1] : "";
    }

    // Extract discount
    var discountMatch = html.match(/<span[^>]*class="[^"]*\bleft-up-tag\b[^"]*"[^>]*>([\s\S]*?)<\/span>/i);
    var discount = discountMatch ? discountMatch[1].replace(/<[^>]+>/g, "").trim() : "";
    
    // Extract button text
    var buttonMatch = html.match(/<div[^>]*class="[^"]*\bcider-button\b[^"]*"[^>]*>(?:[\s\S]*?<div[^>]*class="prefix-view"[^>]*>[\s\S]*?<\/div>)([^<]+)<\/div>/i);
    var buttonText = buttonMatch ? buttonMatch[1].trim() : "";  

    var imageMatch = html.match(/<div[^>]*class="[^"]*\bcider-image\b[^"]*"[^>]*data-img="([^"]+)"/i);
    var imageUrl = imageMatch ? imageMatch[1] : "";

    if (!imageUrl) {
      var imgMatch = html.match(/<img[^>]*class="[^"]*\bcider-image-inner\b[^"]*"[^>]*src="([^"]+)"/i);
      imageUrl = imgMatch ? imgMatch[1] : "";
    }

    return {
      name: name,
      price: price,
      discount: discount,
      buttonText: buttonText,
      imageUrl: imageUrl
    };

  } catch (e) {
    Logger.log("Error scraping " + productUrl + ": " + e);
    return null;
  }
}
