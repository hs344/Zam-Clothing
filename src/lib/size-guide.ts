// Placeholder size-guide measurements. Edit these values to match ZAM's real
// garments. Structured so they can later be moved into a SIZE_GUIDE sheet.

export interface ClothingSizeRow { size: string; chest: string; length: string; shoulder: string }
export interface ShoeSizeRow { uk: string; footLength: string; eu: string }

export const CLOTHING_SIZE_GUIDE: ClothingSizeRow[] = [
  { size: "XS", chest: "36 in", length: "26 in", shoulder: "16 in" },
  { size: "S", chest: "38 in", length: "27 in", shoulder: "17 in" },
  { size: "M", chest: "40 in", length: "28 in", shoulder: "18 in" },
  { size: "L", chest: "42 in", length: "29 in", shoulder: "19 in" },
  { size: "XL", chest: "44 in", length: "30 in", shoulder: "20 in" },
  { size: "XXL", chest: "46 in", length: "31 in", shoulder: "21 in" },
];

export const TROUSER_SIZE_GUIDE = [
  { size: "28", waist: "28 in", hip: "36 in", inseam: "30 in" },
  { size: "30", waist: "30 in", hip: "38 in", inseam: "30 in" },
  { size: "32", waist: "32 in", hip: "40 in", inseam: "31 in" },
  { size: "34", waist: "34 in", hip: "42 in", inseam: "31 in" },
  { size: "36", waist: "36 in", hip: "44 in", inseam: "32 in" },
  { size: "38", waist: "38 in", hip: "46 in", inseam: "32 in" },
];

export const SHOE_SIZE_GUIDE: ShoeSizeRow[] = [
  { uk: "UK 6", footLength: "24.5 cm", eu: "40" },
  { uk: "UK 7", footLength: "25.5 cm", eu: "41" },
  { uk: "UK 8", footLength: "26.5 cm", eu: "42" },
  { uk: "UK 9", footLength: "27.5 cm", eu: "43" },
  { uk: "UK 10", footLength: "28.5 cm", eu: "44" },
  { uk: "UK 11", footLength: "29.5 cm", eu: "45" },
];

export type SizeGuideKind = "clothing" | "trousers" | "shoes";

export function sizeGuideKindFor(categorySlug: string): SizeGuideKind {
  if (categorySlug === "shoes") return "shoes";
  if (categorySlug === "trousers") return "trousers";
  return "clothing";
}
