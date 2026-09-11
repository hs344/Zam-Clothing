/**
 * ============================================================
 *  ZAM CLOTHING — Google Apps Script backend
 * ============================================================
 *
 *  Deploy this file as a Web App (Deploy → New deployment → Web app,
 *  Execute as: Me, Who has access: Anyone). Paste the resulting /exec URL
 *  into the website's APPS_SCRIPT_URL environment variable.
 *
 *  Sheets used (create them with setupSheets() below, or by hand):
 *    PRODUCTS, CATEGORIES, INVENTORY, ORDERS, ORDER_ITEMS, SETTINGS
 *
 *  GET  ?action=GET_PRODUCTS
 *  GET  ?action=GET_PRODUCT&slug=essential-black-tee   (or &product_id=TS001)
 *  GET  ?action=GET_CATEGORIES
 *  GET  ?action=GET_SETTINGS
 *  GET  ?action=SEARCH_PRODUCTS&q=linen
 *  GET  ?action=GET_INVENTORY[&product_id=TS001]
 *  GET  ?action=GET_ORDER_STATUS&order_id=ZAM-10482&phone=9876543210
 *  POST body (JSON): { action: "CREATE_ORDER", customer: {...}, items: [...] }
 *
 *  Every response is JSON: { ok: true, data: ... } or { ok: false, error: "..." }
 * ============================================================
 */

// ----------------------------------------------------------------- CONFIG
// Leave SPREADSHEET_ID empty if this script is bound to the spreadsheet
// (Extensions → Apps Script from inside the sheet). Otherwise paste the ID
// from the sheet URL: https://docs.google.com/spreadsheets/d/<THIS_PART>/edit
var SPREADSHEET_ID = "";

// Optional: if set, CREATE_ORDER requests must include the same api_key.
// Must match APPS_SCRIPT_API_KEY in the website's .env
var API_KEY = "";

// Set to false if you do NOT want stock to be reduced when an order is placed.
var DEDUCT_INVENTORY_ON_ORDER = true;

var SHEETS = {
  PRODUCTS: ["product_id", "name", "slug", "category", "subcategory", "price", "compare_at_price", "description", "short_description", "fabric", "fit", "care", "badge", "status", "featured", "image_1", "image_2", "image_3", "image_4", "sizes", "colours", "tags", "created_at", "updated_at"],
  CATEGORIES: ["category_id", "name", "slug", "description", "image", "display_order", "status"],
  INVENTORY: ["inventory_id", "product_id", "size", "colour", "stock", "sku", "status"],
  ORDERS: ["order_id", "customer_name", "phone", "email", "address", "city", "state", "pincode", "subtotal", "shipping", "discount", "total", "payment_status", "order_status", "whatsapp_order", "created_at"],
  ORDER_ITEMS: ["order_id", "product_id", "product_name", "size", "colour", "quantity", "unit_price", "total"],
  SETTINGS: ["key", "value"],
};

var DEFAULT_SETTINGS = [
  ["site_name", "ZAM CLOTHING"],
  ["currency", "INR"],
  ["shipping_fee", 79],
  ["free_shipping_threshold", 1499],
  ["whatsapp_number", ""],
  ["whatsapp_enabled", "FALSE"],
  ["support_email", ""],
  ["instagram_url", ""],
  ["announcement_text", "Free shipping on orders above ₹1,499"],
  ["store_address", ""],
];

// ------------------------------------------------------------ ENTRYPOINTS
function doGet(e) {
  var params = (e && e.parameter) || {};
  var action = String(params.action || "").toUpperCase();
  try {
    switch (action) {
      case "GET_PRODUCTS":
        return respond(getProducts());
      case "GET_PRODUCT":
        return respond(getProduct(params.slug, params.product_id));
      case "GET_CATEGORIES":
        return respond(getCategories());
      case "GET_SETTINGS":
        return respond(getSettings());
      case "SEARCH_PRODUCTS":
        return respond(searchProducts(params.q));
      case "GET_INVENTORY":
        return respond(getInventory(params.product_id));
      case "GET_ORDER_STATUS":
        return respond(getOrderStatus(params.order_id, params.phone));
      case "PING":
        return respond({ pong: true, time: new Date().toISOString() });
      default:
        return respondError("Unknown action: " + action, 404);
    }
  } catch (err) {
    return respondError(friendlyError(err));
  }
}

function doPost(e) {
  var body = {};
  try {
    body = JSON.parse((e && e.postData && e.postData.contents) || "{}");
  } catch (parseErr) {
    return respondError("Invalid JSON body.");
  }
  var action = String(body.action || "").toUpperCase();
  try {
    switch (action) {
      case "CREATE_ORDER":
        if (API_KEY && body.api_key !== API_KEY) return respondError("Unauthorised.", 401);
        return respond(createOrder(body));
      default:
        return respondError("Unknown action: " + action, 404);
    }
  } catch (err) {
    return respondError(friendlyError(err));
  }
}

// ---------------------------------------------------------------- HELPERS
function respond(data) {
  return ContentService.createTextOutput(JSON.stringify({ ok: true, data: data })).setMimeType(ContentService.MimeType.JSON);
}
function respondError(message) {
  return ContentService.createTextOutput(JSON.stringify({ ok: false, error: message })).setMimeType(ContentService.MimeType.JSON);
}
function friendlyError(err) {
  var msg = err && err.message ? err.message : String(err);
  // Only surface deliberate validation messages (thrown with "ZAM:" prefix); hide internals.
  if (msg.indexOf("ZAM:") === 0) return msg.substring(4).trim();
  console.error(err);
  return "The store backend hit a problem. Please try again.";
}
function fail(message) {
  throw new Error("ZAM: " + message);
}

function getSpreadsheet() {
  return SPREADSHEET_ID ? SpreadsheetApp.openById(SPREADSHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
}

function getSheet(name) {
  var sheet = getSpreadsheet().getSheetByName(name);
  if (!sheet) fail("Sheet '" + name + "' is missing. Run setupSheets() or create it.");
  return sheet;
}

/** Reads a sheet into an array of objects keyed by the header row. */
function readRows(name) {
  var sheet = getSheet(name);
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  var headers = values[0].map(function (h) { return String(h).trim(); });
  var rows = [];
  for (var r = 1; r < values.length; r++) {
    var row = values[r];
    var isEmpty = row.every(function (c) { return c === "" || c === null; });
    if (isEmpty) continue;
    var obj = { _row: r + 1 };
    for (var c = 0; c < headers.length; c++) {
      if (!headers[c]) continue;
      var v = row[c];
      if (v instanceof Date) v = v.toISOString();
      obj[headers[c]] = v;
    }
    rows.push(obj);
  }
  return rows;
}

function strip(obj) {
  var copy = {};
  for (var k in obj) if (k !== "_row") copy[k] = obj[k];
  return copy;
}

function isActive(row) {
  return String(row.status || "active").trim().toLowerCase() === "active";
}
function toNumber(v) {
  var n = parseFloat(String(v === undefined || v === null ? "" : v).replace(/[^\d.-]/g, ""));
  return isNaN(n) ? 0 : n;
}
function toList(v) {
  return String(v || "").split(",").map(function (s) { return s.trim(); }).filter(Boolean);
}
function slugify(s) {
  return String(s || "").toLowerCase().trim().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function digitsOnly(v) {
  var d = String(v || "").replace(/\D/g, "");
  return d.length === 12 && d.indexOf("91") === 0 ? d.substring(2) : d;
}

// -------------------------------------------------------------- CATALOGUE
function getProducts() {
  return readRows("PRODUCTS").filter(isActive).map(function (p) {
    var out = strip(p);
    out.category_slug = slugify(p.category);
    if (!out.slug) out.slug = slugify(p.name);
    return out;
  });
}

function getProduct(slug, productId) {
  var match = getProducts().filter(function (p) {
    return (slug && (p.slug === slug)) || (productId && String(p.product_id) === String(productId));
  })[0];
  if (!match) fail("Product not found.");
  return match;
}

function getCategories() {
  return readRows("CATEGORIES").filter(isActive).map(strip).sort(function (a, b) {
    return toNumber(a.display_order) - toNumber(b.display_order);
  });
}

function getInventory(productId) {
  return readRows("INVENTORY").filter(function (i) {
    return isActive(i) && (!productId || String(i.product_id) === String(productId));
  }).map(strip);
}

function getSettings() {
  var rows = readRows("SETTINGS");
  var out = {};
  DEFAULT_SETTINGS.forEach(function (d) { out[d[0]] = d[1]; });
  rows.forEach(function (r) { if (r.key) out[String(r.key).trim()] = r.value; });
  return out;
}

function searchProducts(q) {
  var query = String(q || "").trim().toLowerCase();
  if (!query) return [];
  var terms = query.split(/\s+/);
  return getProducts().filter(function (p) {
    var hay = [p.name, p.category, p.subcategory, p.short_description, p.tags, p.colours].join(" ").toLowerCase();
    return terms.every(function (t) { return hay.indexOf(t) !== -1; });
  });
}

// ----------------------------------------------------------------- ORDERS
function generateOrderId(existingIds) {
  for (var attempt = 0; attempt < 20; attempt++) {
    var id = "ZAM-" + Math.floor(10000 + Math.random() * 90000);
    if (existingIds.indexOf(id) === -1) return id;
  }
  return "ZAM-" + new Date().getTime().toString().slice(-6);
}

function createOrder(body) {
  var customer = body.customer || {};
  var items = Array.isArray(body.items) ? body.items : [];

  // ---- validate customer
  var required = ["customer_name", "phone", "address", "city", "state", "pincode"];
  required.forEach(function (k) {
    if (!String(customer[k] || "").trim()) fail("Missing customer field: " + k.replace("customer_", "").replace("_", " "));
  });
  var phone = digitsOnly(customer.phone);
  if (phone.length !== 10) fail("Please enter a valid 10-digit phone number.");
  if (!/^\d{6}$/.test(String(customer.pincode).trim())) fail("Please enter a valid 6-digit pincode.");
  if (items.length === 0) fail("Your cart is empty.");

  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var products = getProducts();
    var inventoryRows = readRows("INVENTORY");
    var settings = getSettings();

    // ---- validate items & recalculate totals from the sheet (never trust the browser)
    var lines = [];
    var inventoryUpdates = [];
    items.forEach(function (item) {
      var product = products.filter(function (p) { return String(p.product_id) === String(item.product_id); })[0];
      if (!product) fail("A product in your cart is no longer available.");
      var qty = Math.max(1, Math.floor(toNumber(item.quantity)));
      var size = String(item.size || "").trim();
      var colour = String(item.colour || "").trim();
      var sizes = toList(product.sizes);
      var colours = toList(product.colours);
      if (sizes.length && sizes.indexOf(size) === -1) fail("Please choose a valid size for " + product.name + ".");
      if (colours.length && colours.indexOf(colour) === -1) fail("Please choose a valid colour for " + product.name + ".");

      var inv = inventoryRows.filter(function (i) {
        return isActive(i) && String(i.product_id) === String(product.product_id) &&
          (!sizes.length || String(i.size).trim() === size) && (!colours.length || String(i.colour).trim() === colour);
      })[0];
      if (inv) {
        var stock = toNumber(inv.stock);
        if (stock < qty) fail(product.name + " (" + [size, colour].filter(Boolean).join(" / ") + ") has only " + stock + " left.");
        inventoryUpdates.push({ row: inv._row, stock: stock - qty });
      }
      var price = toNumber(product.price);
      lines.push({
        product_id: product.product_id,
        product_name: product.name,
        size: size,
        colour: colour,
        quantity: qty,
        unit_price: price,
        total: price * qty,
      });
    });

    var subtotal = lines.reduce(function (s, l) { return s + l.total; }, 0);
    var fee = toNumber(settings.shipping_fee);
    var threshold = toNumber(settings.free_shipping_threshold);
    var shipping = threshold > 0 && subtotal >= threshold ? 0 : fee;
    var discount = 0;
    var total = subtotal + shipping - discount;

    // ---- order id
    var ordersSheet = getSheet("ORDERS");
    var existing = readRows("ORDERS").map(function (o) { return String(o.order_id); });
    var requested = String(body.requested_order_id || "").trim().toUpperCase();
    var orderId = /^ZAM-\d{5}$/.test(requested) && existing.indexOf(requested) === -1 ? requested : generateOrderId(existing);
    var createdAt = new Date();

    // ---- write ORDERS
    ordersSheet.appendRow([
      orderId, String(customer.customer_name).trim(), phone, String(customer.email || "").trim(),
      String(customer.address).trim(), String(customer.city).trim(), String(customer.state).trim(), String(customer.pincode).trim(),
      subtotal, shipping, discount, total, "NOT_APPLICABLE", "Pending", "TRUE", createdAt,
    ]);

    // ---- write ORDER_ITEMS
    var itemsSheet = getSheet("ORDER_ITEMS");
    lines.forEach(function (l) {
      itemsSheet.appendRow([orderId, l.product_id, l.product_name, l.size, l.colour, l.quantity, l.unit_price, l.total]);
    });

    // ---- update INVENTORY
    if (DEDUCT_INVENTORY_ON_ORDER && inventoryUpdates.length) {
      var invSheet = getSheet("INVENTORY");
      var stockCol = SHEETS.INVENTORY.indexOf("stock") + 1;
      inventoryUpdates.forEach(function (u) { invSheet.getRange(u.row, stockCol).setValue(u.stock); });
    }

    return {
      order_id: orderId,
      customer: {
        customer_name: String(customer.customer_name).trim(), phone: phone, email: String(customer.email || "").trim(),
        address: String(customer.address).trim(), city: String(customer.city).trim(), state: String(customer.state).trim(), pincode: String(customer.pincode).trim(),
      },
      items: lines,
      subtotal: subtotal,
      shipping: shipping,
      discount: discount,
      total: total,
      payment_status: "NOT_APPLICABLE",
      order_status: "Pending",
      created_at: createdAt.toISOString(),
    };
  } finally {
    lock.releaseLock();
  }
}

function getOrderStatus(orderId, phone) {
  var id = String(orderId || "").trim().toUpperCase();
  var digits = digitsOnly(phone);
  if (!id || !digits) fail("Please enter both your Order ID and phone number.");
  var order = readRows("ORDERS").filter(function (o) {
    return String(o.order_id).trim().toUpperCase() === id && digitsOnly(o.phone) === digits;
  })[0];
  if (!order) fail("We couldn't find an order with that Order ID and phone number.");
  var itemCount = readRows("ORDER_ITEMS").filter(function (i) { return String(i.order_id).trim().toUpperCase() === id; })
    .reduce(function (s, i) { return s + toNumber(i.quantity); }, 0);
  return {
    order_id: order.order_id,
    order_status: String(order.order_status || "Pending").trim(),
    created_at: order.created_at,
    total: toNumber(order.total),
    item_count: itemCount,
  };
}

// ------------------------------------------------------------------ SETUP
/**
 * Run this ONCE from the Apps Script editor (select setupSheets → Run).
 * Creates every required sheet with the exact headers and default settings.
 * Existing sheets are left untouched.
 */
function setupSheets() {
  var ss = getSpreadsheet();
  Object.keys(SHEETS).forEach(function (name) {
    var sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
      sheet.appendRow(SHEETS[name]);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, SHEETS[name].length).setFontWeight("bold");
      if (name === "SETTINGS") DEFAULT_SETTINGS.forEach(function (row) { sheet.appendRow(row); });
    }
  });
  // Nice-to-have: data validation for order_status so the owner picks from a list.
  var orders = ss.getSheetByName("ORDERS");
  var statusCol = SHEETS.ORDERS.indexOf("order_status") + 1;
  var rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Pending", "Confirmed", "Preparing", "Shipped", "Delivered", "Cancelled"], true)
    .setAllowInvalid(false)
    .build();
  orders.getRange(2, statusCol, 1000, 1).setDataValidation(rule);
  var defaultSheet = ss.getSheetByName("Sheet1");
  if (defaultSheet && ss.getSheets().length > 1 && defaultSheet.getLastRow() === 0) ss.deleteSheet(defaultSheet);
  SpreadsheetApp.getUi && SpreadsheetApp.getActive() && Logger.log("ZAM sheets are ready.");
}

/** Quick self-test you can run from the editor: logs product/category counts. */
function selfTest() {
  Logger.log("Products: " + getProducts().length);
  Logger.log("Categories: " + getCategories().length);
  Logger.log("Inventory rows: " + getInventory().length);
  Logger.log("Settings: " + JSON.stringify(getSettings()));
}
