# WhatsApp Order Mistake Detector

AI-assisted order validation for WhatsApp sellers.

## MVP
- Paste a WhatsApp order message
- Parse products, quantities, variants, price and payment method
- Compare against a product catalog
- Detect price, quantity, missing variant, incomplete address and duplicate-order risks
- Return a confidence score and recommended action

## Planned stack
Next.js + TypeScript + Tailwind + PostgreSQL + LLM API.

## Development
The first milestone is a local, deterministic order-analysis prototype. WhatsApp API integration comes after the detector is reliable.
