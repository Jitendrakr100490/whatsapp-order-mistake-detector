import { analyzeOrderV2, CatalogProduct } from './detector-v2';

export const testCatalog: CatalogProduct[] = [
  { id: 'hoodie', name: 'hoodie', price: 549, variants: [
    { sku: 'H-B-L', size: 'L', color: 'black', price: 549 },
    { sku: 'H-R-XL', size: 'XL', color: 'red', price: 599 },
  ] },
  { id: 'shoes', name: 'shoes', price: 1099, variants: [
    { sku: 'S-8-R', size: '8', color: 'red', price: 1099 },
  ] },
];

export const detectorTestCases = [
  { name: 'price mismatch', message: '2 hoodie L black aur 1 hoodie XL red, total 1600 COD, house 12 Aligarh 202001', expected: 'PRICE_MISMATCH' },
  { name: 'missing variant', message: '2 hoodie bhej do COD, house 12 Aligarh 202001', expected: 'MISSING_VARIANT' },
  { name: 'incomplete address', message: '2 hoodie L black COD', expected: 'INCOMPLETE_ADDRESS' },
  { name: 'duplicate', message: '2 hoodie L black COD, house 12 Aligarh 202001', previous: [[{ productId: 'hoodie', productName: 'hoodie', quantity: 2, size: 'L', color: 'black' }]], expected: 'POSSIBLE_DUPLICATE' },
];

export function runDetectorSmokeTests() {
  return detectorTestCases.map((test) => {
    const result = analyzeOrderV2(test.message, testCatalog, test.previous ?? []);
    return { name: test.name, passed: result.issues.some(i => i.type === test.expected), detected: result.issues.map(i => i.type) };
  });
}
