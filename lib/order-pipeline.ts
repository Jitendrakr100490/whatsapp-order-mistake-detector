import { parseWhatsAppOrder, ParsedOrder } from './ai-parser';
import { analyzeOrderV2, CatalogProduct } from './detector-v2';

export function analyzeWhatsAppOrder(message: string, catalog: CatalogProduct[], previousOrders: Parameters<typeof analyzeOrderV2>[2] = []) {
  const parsed: ParsedOrder = parseWhatsAppOrder(message, catalog.map(p => p.name));
  const detection = analyzeOrderV2(message, catalog, previousOrders);

  const parserIssues = parsed.unresolved.map(field => ({
    type: `UNRESOLVED_${field.toUpperCase()}`,
    severity: 'warning' as const,
    message: `The order parser could not resolve ${field}. Do not guess this value.`,
  }));

  const issues = [...detection.issues, ...parserIssues];
  const confidence = Math.max(0, Math.min(100, Math.round((parsed.confidence + detection.confidence) / 2)));

  return {
    parsed,
    detection,
    issues,
    confidence,
    safeToConfirm: issues.length === 0 && confidence >= 90,
    recommendedAction: issues.some(i => i.severity === 'critical') || confidence < 70
      ? 'ASK_CUSTOMER'
      : issues.length
        ? 'REVIEW'
        : 'CONFIRM',
  };
}
