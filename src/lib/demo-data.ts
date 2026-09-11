// ---------------------------------------------------------------------------
// DEMO / FALLBACK DATA
//
// Used ONLY when the Google Apps Script URL is not configured. Rows are shaped
// exactly like the Google Sheets columns so they can be exported to CSV
// (see scripts/export-sheets-csv.ts) and imported straight into the sheet.
// Replace freely — nothing in the UI depends on these specific products.
// ---------------------------------------------------------------------------

const img = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800`;

const CLOTHING_SIZES = "XS,S,M,L,XL,XXL";
const SHOE_SIZES = "UK 6,UK 7,UK 8,UK 9,UK 10,UK 11";

export const DEMO_CATEGORIES = [
  { category_id: "CAT01", name: "T-Shirts", slug: "t-shirts", description: "Everyday essentials, made for everyday wear.", image: "/images/category-tshirts.jpg", display_order: 1, status: "active" },
  { category_id: "CAT02", name: "Shirts", slug: "shirts", description: "Relaxed shirts that go from campus to café.", image: "/images/category-shirts.jpg", display_order: 2, status: "active" },
  { category_id: "CAT03", name: "Trousers", slug: "trousers", description: "Easy trousers with room to move.", image: "/images/category-trousers.jpg", display_order: 3, status: "active" },
  { category_id: "CAT04", name: "Shoes", slug: "shoes", description: "Clean, comfortable footwear for long days.", image: "/images/category-shoes.jpg", display_order: 4, status: "active" },
];

export const DEMO_SETTINGS = {
  site_name: "ZAM CLOTHING",
  currency: "INR",
  shipping_fee: 79,
  free_shipping_threshold: 1499,
  whatsapp_number: "",
  whatsapp_enabled: "FALSE",
  support_email: "hello@zamclothing.example",
  instagram_url: "https://instagram.com/",
  announcement_text: "Free shipping on orders above ₹1,499",
  store_address: "ZAM Clothing Studio, Your City, India",
};

type Row = {
  product_id: string; name: string; slug: string; category: string; subcategory: string;
  price: number; compare_at_price: number | ""; description: string; short_description: string;
  fabric: string; fit: string; care: string; badge: string; status: string; featured: string;
  image_1: string; image_2: string; image_3: string; image_4: string;
  sizes: string; colours: string; tags: string; created_at: string; updated_at: string;
};

function row(
  product_id: string, name: string, category: string, subcategory: string, price: number,
  compare: number | "", short: string, description: string, fabric: string, fit: string, care: string,
  badge: string, featured: boolean, images: number[], sizes: string, colours: string, tags: string, created: string,
): Row {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return {
    product_id, name, slug, category, subcategory, price, compare_at_price: compare,
    description, short_description: short, fabric, fit, care, badge, status: "active",
    featured: featured ? "TRUE" : "FALSE",
    image_1: img(images[0]), image_2: images[1] ? img(images[1]) : "", image_3: images[2] ? img(images[2]) : "", image_4: images[3] ? img(images[3]) : "",
    sizes, colours, tags, created_at: created, updated_at: created,
  };
}

const T = "T-Shirts", S = "Shirts", SH = "Shoes", TR = "Trousers";
const WASH = "Machine wash cold. Do not bleach. Dry in shade.";
const LEATHER = "Wipe with a soft dry cloth. Keep away from direct heat.";

export const DEMO_PRODUCTS: Row[] = [
  // ---------------- T-SHIRTS ----------------
  row("TS001", "Essential Black Tee", T, "Basic", 699, 899, "Everyday cotton essential", "The one you reach for every morning. A mid-weight 100% cotton crew neck with a clean regular fit, reinforced neck rib and a soft-washed hand feel that only gets better with wear.", "100% Combed Cotton, 180 GSM", "Regular", WASH, "BESTSELLER", true, [32071161, 20669538], CLOTHING_SIZES, "Black,White,Grey", "cotton,everyday,basic,crew neck", "2025-01-10"),
  row("TS002", "Cloud White Crew", T, "Basic", 649, "", "Breathable white crew neck", "A clean white crew neck in breathable combed cotton. Slightly heavier fabric so it stays opaque and holds its shape wash after wash.", "100% Combed Cotton, 200 GSM", "Regular", WASH, "", false, [20669538, 30710033], CLOTHING_SIZES, "White,Beige", "cotton,everyday,white,crew neck", "2025-01-12"),
  row("TS003", "Oversized Sand Tee", T, "Oversized", 799, 999, "Relaxed drop-shoulder tee", "A relaxed drop-shoulder tee in warm sand. Boxy through the body with a slightly longer sleeve. Made for easy weekends.", "100% Cotton, 220 GSM", "Oversized", WASH, "NEW", true, [18257675, 20669538], CLOTHING_SIZES, "Beige,Black,Olive", "cotton,oversized,relaxed", "2025-03-02"),
  row("TS004", "Olive Pocket Tee", T, "Pocket", 749, "", "Soft cotton tee with chest pocket", "A soft cotton tee with a single chest pocket. Slightly relaxed through the shoulder with a curved hem that sits well untucked.", "100% Cotton, 180 GSM", "Relaxed", WASH, "", false, [9594692, 18257675], CLOTHING_SIZES, "Olive,Grey,Black", "cotton,pocket,relaxed", "2025-02-05"),
  row("TS005", "Rust Heavyweight Tee", T, "Heavyweight", 899, 1099, "Structured heavyweight cotton", "A structured heavyweight tee with a firm collar and a slightly boxy cut. The fabric is dense enough to hold its shape but soft enough for all-day wear.", "100% Cotton, 240 GSM", "Boxy", WASH, "LIMITED", false, [8148577, 18265937], "S,M,L,XL", "Rust,Black", "cotton,heavyweight,boxy", "2025-03-15"),
  row("TS006", "Everyday Grey Melange", T, "Basic", 649, "", "Classic melange crew neck", "The classic grey melange crew neck. Light, soft and easy to layer. A staple for training days and lazy days alike.", "60% Cotton 40% Polyester, 170 GSM", "Regular", WASH, "", true, [30710033, 8217291], CLOTHING_SIZES, "Grey,Blue", "cotton,everyday,melange,basic", "2025-01-20"),
  row("TS007", "Colour Block Tee", T, "Graphic", 849, "", "Two-tone relaxed tee", "A two-tone relaxed tee with contrast panels at the sleeves. Cut a touch longer for a modern proportion.", "100% Cotton, 200 GSM", "Relaxed", WASH, "NEW", false, [18265937, 8217291], CLOTHING_SIZES, "Blue,Beige", "cotton,graphic,colour block", "2025-03-20"),

  // ---------------- SHIRTS ----------------
  row("SH001", "Sand Linen Shirt", S, "Linen", 1299, 1599, "Breezy short-sleeve linen", "A breezy short-sleeve linen shirt with a camp collar. Wears cool in the heat and softens with every wash.", "55% Linen 45% Cotton", "Relaxed", "Machine wash gentle. Iron while damp.", "BESTSELLER", true, [17251247, 4443831], CLOTHING_SIZES, "Beige,White,Olive", "linen,summer,short sleeve,shirt", "2025-02-01"),
  row("SH002", "Midnight Oxford Shirt", S, "Oxford", 1199, "", "Classic long-sleeve oxford", "A classic long-sleeve oxford shirt in deep navy. Button-down collar, single chest pocket and a comfortable regular fit.", "100% Cotton Oxford", "Regular", WASH, "", false, [32224552, 8972551], CLOTHING_SIZES, "Blue,Black,White", "oxford,formal,long sleeve,shirt", "2025-01-25"),
  row("SH003", "Dotted Blue Casual Shirt", S, "Printed", 1099, 1399, "Subtle dotted print shirt", "A subtle dotted print shirt in a soft cotton poplin. Works tucked in with trousers or loose over a tee.", "100% Cotton Poplin", "Regular", WASH, "NEW", false, [4443831, 17251247], CLOTHING_SIZES, "Blue,White", "printed,casual,shirt", "2025-03-05"),
  row("SH004", "Black Utility Shirt", S, "Utility", 1249, "", "Overshirt with twin pockets", "A structured overshirt with twin chest pockets. Heavier cotton twill so it layers like a light jacket.", "100% Cotton Twill", "Relaxed", WASH, "", true, [11576957, 8972551], CLOTHING_SIZES, "Black,Olive", "utility,overshirt,shirt", "2025-02-14"),
  row("SH005", "Sage Camp Collar Shirt", S, "Camp Collar", 1149, "", "Soft camp-collar summer shirt", "A soft camp-collar shirt in muted sage. Relaxed through the body with a straight hem.", "100% Cotton", "Relaxed", WASH, "", false, [17715647, 37741918], "S,M,L,XL", "Olive,Beige", "camp collar,summer,shirt", "2025-03-10"),
  row("SH006", "Printed Resort Shirt", S, "Printed", 1349, 1699, "Relaxed printed resort shirt", "A relaxed resort shirt in a breathable viscose blend with an all-over leaf print. Made for holidays and Sunday brunches.", "70% Viscose 30% Cotton", "Relaxed", "Hand wash cold. Do not wring.", "LIMITED", false, [30710542, 37741918], CLOTHING_SIZES, "Blue,White", "printed,resort,summer,shirt", "2025-03-22"),

  // ---------------- SHOES ----------------
  row("SO001", "Court White Sneakers", SH, "Sneakers", 1999, 2499, "Minimal white court sneaker", "A minimal white court sneaker with a cushioned insole and a durable rubber cup sole. Goes with everything.", "PU Leather Upper, Rubber Sole", "True to size", LEATHER, "BESTSELLER", true, [12628400, 18375077], SHOE_SIZES, "White", "sneakers,white,minimal,shoes", "2025-01-15"),
  row("SO002", "Street Black Runners", SH, "Runners", 2199, "", "Lightweight everyday runner", "A lightweight everyday runner with a breathable knit upper and a soft EVA midsole for all-day comfort.", "Knit Upper, EVA Midsole", "True to size", "Spot clean with mild soap.", "", false, [18972408, 19271383], SHOE_SIZES, "Black,Grey", "runners,sneakers,black,shoes", "2025-02-08"),
  row("SO003", "Navy Suede Low-Tops", SH, "Sneakers", 2399, 2899, "Soft suede low-top sneaker", "A soft suede low-top with tonal laces and a natural gum sole. A quiet upgrade to the everyday sneaker.", "Suede Upper, Gum Rubber Sole", "True to size", "Brush gently. Use suede protector.", "NEW", true, [20755674, 13580587], SHOE_SIZES, "Blue,Beige", "suede,sneakers,low top,shoes", "2025-03-08"),
  row("SO004", "Retro High-Tops", SH, "High-Tops", 2499, "", "Padded retro high-top", "A padded retro high-top with a chunky rubber sole. Extra ankle support and a bold, easy silhouette.", "Canvas & PU Upper, Rubber Sole", "Runs half size large", "Spot clean with mild soap.", "", false, [4273288, 18375077], SHOE_SIZES, "White,Black", "high top,retro,sneakers,shoes", "2025-02-20"),
  row("SO005", "Ocean Blue Trainers", SH, "Trainers", 1899, 2299, "Everyday mesh trainers", "Everyday mesh trainers in ocean blue. Breathable, light and easy on long walks.", "Mesh Upper, EVA Sole", "True to size", "Spot clean with mild soap.", "", false, [13580587, 8979071], SHOE_SIZES, "Blue,Black", "trainers,mesh,blue,shoes", "2025-02-28"),
  row("SO006", "Classic Court Black", SH, "Sneakers", 1999, "", "Black leather court sneaker", "The court sneaker in all black. Clean lines, cushioned insole and a durable cup sole.", "PU Leather Upper, Rubber Sole", "True to size", LEATHER, "", true, [19271383, 18972408], SHOE_SIZES, "Black", "sneakers,black,minimal,shoes", "2025-03-12"),

  // ---------------- TROUSERS ----------------
  row("TR001", "Relaxed Beige Chinos", TR, "Chinos", 1499, 1899, "Everyday relaxed chinos", "Everyday relaxed chinos in a soft brushed cotton twill. Straight through the leg with a comfortable mid rise.", "98% Cotton 2% Elastane", "Relaxed Straight", WASH, "BESTSELLER", true, [10341113, 20574052], "28,30,32,34,36", "Beige,Olive,Black", "chinos,relaxed,everyday,trousers", "2025-01-18"),
  row("TR002", "Charcoal Pleated Trousers", TR, "Pleated", 1699, "", "Wide-leg pleated trousers", "Single-pleat wide-leg trousers in a drapey charcoal blend. Elegant enough for evenings, relaxed enough for every day.", "65% Polyester 35% Viscose", "Wide Leg", "Dry clean or gentle machine wash.", "NEW", true, [20574052, 7256412], "28,30,32,34,36", "Grey,Black", "pleated,wide leg,smart,trousers", "2025-03-01"),
  row("TR003", "Checked Cotton Trousers", TR, "Printed", 1599, 1999, "Subtle checked straight trousers", "Straight-leg trousers in a subtle check. Light cotton blend with a touch of stretch.", "97% Cotton 3% Elastane", "Straight", WASH, "", false, [18471580, 2897533], "28,30,32,34", "Grey,Beige", "checked,straight,trousers", "2025-02-12"),
  row("TR004", "Black Everyday Trousers", TR, "Basic", 1399, "", "Clean straight black trousers", "Clean straight black trousers with a flat front and a comfortable elasticated back waistband.", "100% Cotton", "Straight", WASH, "", true, [7256412, 29616932], "28,30,32,34,36,38", "Black,Grey", "black,everyday,basic,trousers", "2025-01-30"),
  row("TR005", "Olive Cargo Trousers", TR, "Cargo", 1799, 2199, "Relaxed cargo with side pockets", "Relaxed cargo trousers with two side pockets and an adjustable drawcord hem. Sturdy cotton ripstop.", "100% Cotton Ripstop", "Relaxed", WASH, "LIMITED", false, [29616932, 18471580], "28,30,32,34,36", "Olive,Black,Beige", "cargo,relaxed,utility,trousers", "2025-03-18"),
  row("TR006", "Tapered Navy Trousers", TR, "Tapered", 1549, "", "Smart tapered trousers", "Smart tapered trousers in deep navy. Slim through the thigh with a gentle taper to the ankle.", "70% Cotton 28% Polyester 2% Elastane", "Tapered", WASH, "", false, [2897533, 10341113], "28,30,32,34,36", "Blue,Black", "tapered,smart,trousers", "2025-02-24"),
];

const COLOUR_CODES: Record<string, string> = {
  Black: "BLK", White: "WHT", Grey: "GRY", Beige: "BEI", Blue: "BLU", Olive: "OLV", Rust: "RST",
};

/** Deterministic inventory generator so every variant has a stock value. */
export function buildDemoInventory() {
  const rows: { inventory_id: string; product_id: string; size: string; colour: string; stock: number; sku: string; status: string }[] = [];
  let n = 1;
  for (const p of DEMO_PRODUCTS) {
    const sizes = p.sizes.split(",").map((s) => s.trim());
    const colours = p.colours.split(",").map((s) => s.trim());
    sizes.forEach((size, si) => {
      colours.forEach((colour, ci) => {
        // A few variants are intentionally out of stock to demonstrate availability UI.
        const seed = (si * 7 + ci * 3 + p.product_id.charCodeAt(4)) % 11;
        const stock = seed === 0 ? 0 : 4 + seed * 2;
        rows.push({
          inventory_id: `INV${String(n++).padStart(4, "0")}`,
          product_id: p.product_id,
          size,
          colour,
          stock,
          sku: `${p.product_id}-${size.replace(/\s+/g, "")}-${COLOUR_CODES[colour] ?? colour.slice(0, 3).toUpperCase()}`,
          status: "active",
        });
      });
    });
  }
  return rows;
}

export const DEMO_INVENTORY = buildDemoInventory();
