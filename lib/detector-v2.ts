export type CatalogVariant = { sku: string; size?: string; color?: string; price: number };
export type CatalogProduct = { id: string; name: string; price: number; variants?: CatalogVariant[] };
export type OrderItem = { productId: string; productName: string; quantity: number; size?: string; color?: string; unitPrice?: number };
export type Issue = { type: string; severity: 'critical' | 'warning'; message: string; expected?: string; actual?: string; difference?: number };

const sizePattern = /\b(?:size\s*)?(xs|s|m|l|xl|xxl|xxxl|6|7|8|9|10|11|12)\b/i;
const colorPattern = /\b(black|white|red|blue|green|yellow|pink|grey|gray|brown|beige|navy)\b/i;

export function parseOrderItems(message: string, catalog: CatalogProduct[]): OrderItem[] {
  const lower = message.toLowerCase();
  return catalog.flatMap((product) => {
    if (!lower.includes(product.name.toLowerCase())) return [];
    const escaped = product.name.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = lower.match(new RegExp(`(?:^|\\b)(\\d+)\\s*(?:x|pcs?|pieces?)?\\s*${escaped}\\b`));
    const quantity = match ? Number(match[1]) : 1;
    const size = lower.match(sizePattern)?.[1]?.toUpperCase();
    const color = lower.match(colorPattern)?.[1];
    return [{ productId: product.id, productName: product.name, quantity, size, color, unitPrice: product.price }];
  });
}

export function analyzeOrderV2(message: string, catalog: CatalogProduct[], previousOrders: OrderItem[][] = []) {
  const lower = message.toLowerCase();
  const issues: Issue[] = [];
  const items = parseOrderItems(message, catalog);
  let expectedTotal = 0;

  for (const item of items) {
    const product = catalog.find((p) => p.id === item.productId)!;
    const needsVariant = Boolean(product.variants?.length);
    if (needsVariant && !item.size && !item.color) {
      issues.push({ type: 'MISSING_VARIANT', severity: 'warning', message: `${product.name} needs a size or color/variant confirmation.` });
    }
    const variant = product.variants?.find((v) => (!item.size || v.size?.toLowerCase() === item.size.toLowerCase()) && (!item.color || v.color?.toLowerCase() === item.color.toLowerCase()));
    if (needsVariant && (item.size || item.color) && !variant) {
      issues.push({ type: 'INVALID_VARIANT', severity: 'critical', message: `${product.name} does not have the requested variant.` });
    }
    expectedTotal += (variant?.price ?? product.price) * item.quantity;
  }

  const totalMatch = lower.match(/(?:total|grand total|amount|₹|rs\.?|inr)\s*[:=]?\s*(\d+(?:\.\d+)?)/i);
  const statedTotal = totalMatch ? Number(totalMatch[1]) : null;
  if (statedTotal !== null && items.length && statedTotal !== expectedTotal) {
    issues.push({ type: 'PRICE_MISMATCH', severity: 'critical', message: 'Customer-stated total does not match the catalog calculation.', expected: `₹${expectedTotal}`, actual: `₹${statedTotal}`, difference: expectedTotal - statedTotal });
  }

  const hasAddressSignal = /(?:house|h\.?no|flat|shop|street|road|nagar|colony|sector|pin|pincode|postal|address)/i.test(message);
  if (!hasAddressSignal) issues.push({ type: 'INCOMPLETE_ADDRESS', severity: 'warning', message: 'No delivery-address details were detected.' });
  if (!/(?:cod|cash on delivery|upi|online|prepaid|cash)/i.test(message)) issues.push({ type: 'MISSING_PAYMENT_METHOD', severity: 'warning', message: 'Payment method was not detected.' });
  if (!items.length) issues.push({ type: 'UNKNOWN_PRODUCT', severity: 'warning', message: 'No catalog product could be matched confidently.' });

  const signature = items.map(i => `${i.productId}:${i.quantity}:${i.size ?? ''}:${i.color ?? ''}`).sort().join('|');
  const duplicate = previousOrders.some(order => order.map(i => `${i.productId}:${i.quantity}:${i.size ?? ''}:${i.color ?? ''}`).sort().join('|') === signature && signature.length > 0);
  if (duplicate) issues.push({ type: 'POSSIBLE_DUPLICATE', severity: 'critical', message: 'A previous order has the same product, quantity and variant combination.' });

  const confidence = Math.max(0, Math.min(100, 100 - issues.filter(i => i.severity === 'critical').length * 30 - issues.filter(i => i.severity === 'warning').length * 8));
  return { items, expectedTotal, statedTotal, issues, confidence, recommendation: issues.some(i => i.severity === 'critical') ? 'Ask customer to clarify before confirming.' : issues.length ? 'Review warnings before confirming.' : 'Safe to confirm.' };
}
