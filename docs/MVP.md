# MVP Specification

## Goal
Given a WhatsApp-style customer message and a seller catalog, produce a structured order, identify actionable inconsistencies, calculate the expected total, and recommend whether the seller should confirm or clarify the order.

## Initial detectors
1. PRICE_MISMATCH
2. QUANTITY_MISMATCH
3. MISSING_VARIANT
4. INCOMPLETE_ADDRESS
5. POSSIBLE_DUPLICATE

## Safety principle
Unknown values must remain UNKNOWN. The parser must not invent a size, price, quantity, address field, or product match when evidence is insufficient.

## First UI
- Dashboard
- Orders
- Order detail
- Mistakes
- Products
- Settings

## First input flow
Paste WhatsApp message -> Analyze -> Parsed order -> Detected issues -> Expected total -> Confidence -> Recommended action.

## Out of scope for MVP
- Live WhatsApp integration
- Automatic customer messages
- Payment gateway reconciliation
- Inventory synchronization
- Multi-business billing
