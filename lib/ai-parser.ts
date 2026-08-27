export type ParsedOrderItem = {
  productName: string;
  quantity: number | null;
  size: string | null;
  color: string | null;
  statedUnitPrice: number | null;
  confidence: number;
};

export type ParsedOrder = {
  items: ParsedOrderItem[];
  statedTotal: number | null;
  paymentMethod: string | null;
  address: string | null;
  unresolved: string[];
  confidence: number;
};

const COLORS = ['black','white','red','blue','green','yellow','pink','grey','gray','brown','beige','navy'];
const SIZE_RE = /\b(?:size\s*)?(xs|s|m|l|xl|xxl|xxxl|\d{1,2})\b/i;

function findNumberBeforeProduct(text: string, product: string) {
  const escaped = product.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = text.match(new RegExp(`(?:^|\\b)(\\d+)\\s*(?:x|pcs?|pieces?)?\\s*${escaped}`, 'i'));
  return match ? Number(match[1]) : null;
}

function findMoney(text: string) {
  const matches = [...text.matchAll(/(?:₹|rs\.?|inr)\s*(\d+(?:\.\d+)?)/gi)].map(m => Number(m[1]));
  const totalMatch = text.match(/(?:total|grand total|amount)\s*[:=]?\s*₹?\s*(\d+(?:\.\d+)?)/i);
  return totalMatch ? Number(totalMatch[1]) : matches.at(-1) ?? null;
}

export function parseWhatsAppOrder(message: string, knownProducts: string[]): ParsedOrder {
  const text = message.trim();
  const lower = text.toLowerCase();
  const items: ParsedOrderItem[] = [];

  for (const product of knownProducts) {
    if (!lower.includes(product.toLowerCase())) continue;
    const quantity = findNumberBeforeProduct(text, product);
    const size = text.match(SIZE_RE)?.[1]?.toUpperCase() ?? null;
    const colorMatch = COLORS.find(c => lower.includes(c));
    const priceMatch = text.match(new RegExp(`${product.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^₹0-9]{0,30}(?:₹|rs\\.?|inr)?\\s*(\\d+(?:\\.\\d+)?)`, 'i'));
    items.push({ productName: product, quantity, size, color: colorMatch ?? null, statedUnitPrice: priceMatch ? Number(priceMatch[1]) : null, confidence: quantity !== null ? 0.92 : 0.72 });
  }

  const unresolved: string[] = [];
  if (!items.length) unresolved.push('product');
  if (items.some(i => i.quantity === null)) unresolved.push('quantity');
  if (/last\s+(?:wale|one)|same\s+(?:address|place)|wahi\s+(?:address|jagah)/i.test(text)) unresolved.push('previous_address');

  const paymentMethod = /cash\s*on\s*delivery|\bcod\b/i.test(text) ? 'COD' : /\bupi\b|online|prepaid/i.test(text) ? 'PREPAID' : null;
  if (!paymentMethod) unresolved.push('payment_method');

  const addressSignal = /(?:house|h\.?no|flat|shop|street|road|nagar|colony|sector|pin|pincode|address|aligarh|delhi|agra|noida)/i.test(text);
  const address = addressSignal ? text : null;
  if (!address) unresolved.push('address');

  const statedTotal = findMoney(text);
  const confidence = Math.max(0, Math.min(100, Math.round(100 - unresolved.length * 10 - items.filter(i => i.confidence < 0.8).length * 8)));
  return { items, statedTotal, paymentMethod, address, unresolved: [...new Set(unresolved)], confidence };
}
