import { parseWhatsAppOrder } from './ai-parser';

const products = ['black hoodie', 'red hoodie'];

export const aiParserCases = [
  {
    name: 'quantity after product',
    message: 'black hoodie 2 laga do COD house 12 Aligarh 202001',
    check: (r: ReturnType<typeof parseWhatsAppOrder>) => r.items[0]?.quantity === 2,
  },
  {
    name: 'ellipsized second product',
    message: '2 black hoodie aur ek red XL bhi COD house 12 Aligarh 202001',
    check: (r: ReturnType<typeof parseWhatsAppOrder>) => r.items.some(i => i.productName === 'red hoodie' && i.size === 'XL'),
  },
  {
    name: 'unknown quantity stays unknown',
    message: 'black hoodie bhej do COD house 12 Aligarh 202001',
    check: (r: ReturnType<typeof parseWhatsAppOrder>) => r.items[0]?.quantity === null && r.unresolved.includes('quantity'),
  },
  {
    name: 'unit price is not total',
    message: '2 black hoodie ₹549 COD house 12 Aligarh 202001',
    check: (r: ReturnType<typeof parseWhatsAppOrder>) => r.items[0]?.statedUnitPrice === 549 && r.statedTotal === null,
  },
];

export function runAiParserSmokeTests() {
  return aiParserCases.map(test => ({ name: test.name, passed: test.check(parseWhatsAppOrder(test.message, products)) }));
}
