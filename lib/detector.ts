export type CatalogItem = { id: string; name: string; variants?: Record<string, number>; price: number };
export type DetectedIssue = { type: string; severity: 'critical' | 'warning'; message: string; expected?: string; actual?: string; difference?: number };

export function analyzeOrder(message: string, catalog: CatalogItem[]) {
  const lower = message.toLowerCase();
  const issues: DetectedIssue[] = [];
  const items = catalog.filter((item) => lower.includes(item.name.toLowerCase()));
  let expectedTotal = 0;

  for (const item of items) {
    const quantityMatch = lower.match(new RegExp(`(\\d+)\\s+(?:x\\s*)?${item.name.toLowerCase().replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}`));
    const quantity = quantityMatch ? Number(quantityMatch[1]) : 1;
    expectedTotal += quantity * item.price;

    const variantMissing = item.variants && /size|colour|color/.test(item.name.toLowerCase()) === false && /size|colour|color/.test(lower) === false;
    if (variantMissing && item.variants) {
      issues.push({ type: 'MISSING_VARIANT', severity: 'warning', message: `${item.name} may require a variant selection.` });
    }
  }

  const statedTotalMatch = lower.match(/(?:total|₹|rs\.?|inr)\s*[:=]?\s*(\d+(?:\.\d+)?)/);
  const statedTotal = statedTotalMatch ? Number(statedTotalMatch[1]) : null;
  if (statedTotal !== null && expectedTotal > 0 && statedTotal !== expectedTotal) {
    issues.push({ type: 'PRICE_MISMATCH', severity: 'critical', message: 'Customer-stated total does not match catalog calculation.', expected: `₹${expectedTotal}`, actual: `₹${statedTotal}`, difference: expectedTotal - statedTotal });
  }

  if (items.length === 0) issues.push({ type: 'UNKNOWN_PRODUCT', severity: 'warning', message: 'No catalog product could be matched confidently.' });
  if (!/cod|upi|online|prepaid|cash/.test(lower)) issues.push({ type: 'MISSING_PAYMENT_METHOD', severity: 'warning', message: 'Payment method was not detected.' });

  const confidence = Math.max(0, Math.min(100, 100 - issues.filter(i => i.severity === 'critical').length * 30 - issues.filter(i => i.severity === 'warning').length * 8));
  return { items, expectedTotal, statedTotal, issues, confidence, recommendation: issues.some(i => i.severity === 'critical') ? 'Ask customer to clarify before confirming.' : issues.length ? 'Review warnings before confirming.' : 'Safe to confirm.' };
}
