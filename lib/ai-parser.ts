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

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function findQuantity(text: string, product: string) {
  const escaped = escapeRegex(product);
  const before = text.match(new RegExp(`(?:^|\\b)(\\d+)\\s*(?:x|pcs?|pieces?)?\\s*${escaped}`, 'i'));
  if (before) return Number(before[1]);
  const after = text.match(new RegExp(`${escaped}\\s*(?:x|[-:]|\\s)+(\\d+)(?:\\s*(?:pcs?|pieces?))?\\b`, 'i'));
  return after ? Number(after[1]) : null;
}

function splitClauses(text: string) {
  return text.split(/\s+(?:aur|and|&|,|plus|also|bhi)\s+|[,;]|\n+/i).map(s => s.trim()).filter(Boolean);
}

function findAssociatedClause(text: string, product: string) {
  const clauses = splitClauses(text);
  const direct = clauses.find(c => c.toLowerCase().includes(product.toLowerCase()));
  if (direct) return direct;

  const words = product.toLowerCase().split(/\s+/).filter(Boolean);
  return clauses.find(c => words.some(w => c.toLowerCase().includes(w))) ?? '';
}

function findMoney(text: string) {
  const totalMatch = text.match(/(?:grand\s+total|total|amount|pay|dena\s+hai|ban\s+raha)\s*[:=]?\s*(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)/i);
  return totalMatch ? Number(totalMatch[1]) : null;
}

function findExplicitUnitPrice(clause: string) {
  const match = clause.match(/(?:₹|rs\.?|inr)\s*(\d+(?:\.\d+)?)/i);
  return match ? Number(match[1]) : null;
}

export function parseWhatsAppOrder(message: string, knownProducts: string[]): ParsedOrder {
  const text = message.trim();
  const lower = text.toLowerCase();
  const items: ParsedOrderItem[] = [];

  for (const product of knownProducts) {
    const productLower = product.toLowerCase();
    const explicit = lower.includes(productLower);
    const clause = findAssociatedClause(text, product);
    const referencedByAttributes = !explicit && COLORS.some(c => clause.toLowerCase().includes(c)) && product.toLowerCase().split(/\s+/).some(w => clause.toLowerCase().includes(w));
    if (!explicit && !referencedByAttributes) continue;

    const quantity = findQuantity(clause || text, product);
    const size = clause.match(SIZE_RE)?.[1]?.toUpperCase() ?? null;
    const color = COLORS.find(c => new RegExp(`\\b${escapeRegex(c)}\\b`, 'i').test(clause)) ?? null;
    const statedUnitPrice = findExplicitUnitPrice(clause);
    const confidence = quantity !== null ? (explicit ? 0.94 : 0.82) : (explicit ? 0.74 : 0.66);
    items.push({ productName: product, quantity, size, color, statedUnitPrice, confidence });
  }

  const unresolved: string[] = [];
  if (!items.length) unresolved.push('product');
  if (items.some(i => i.quantity === null)) unresolved.push('quantity');
  if (items.some(i => i.size === null && /size|shoe|shoes|hoodie|tshirt|t-shirt/i.test(i.productName))) unresolved.push('variant');
  if (/last\s+(?:wale|one)|same\s+(?:address|place)|wahi\s+(?:address|jagah)/i.test(text)) unresolved.push('previous_address');

  const paymentMethod = /cash\s*on\s*delivery|\bcod\b/i.test(text) ? 'COD' : /\bupi\b|online|prepaid/i.test(text) ? 'PREPAID' : null;
  if (!paymentMethod) unresolved.push('payment_method');

  const addressSignal = /(?:house|h\.?no|flat|shop|street|road|nagar|colony|sector|pin|pincode|address|aligarh|delhi|agra|noida)/i.test(text);
  const address = addressSignal ? text : null;
  if (!address) unresolved.push('address');

  const statedTotal = findMoney(text);
  const itemConfidence = items.length ? items.reduce((sum, item) => sum + item.confidence, 0) / items.length : 0;
  const confidence = Math.max(0, Math.min(100, Math.round(itemConfidence * 100 - new Set(unresolved).size * 7)));
  return { items, statedTotal, paymentMethod, address, unresolved: [...new Set(unresolved)], confidence };
}
