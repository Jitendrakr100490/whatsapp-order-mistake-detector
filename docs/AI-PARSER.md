# AI Parser Contract

The parser converts messy WhatsApp/Hinglish order messages into a structured order object before validation.

## Non-negotiable rule
Never invent missing values. Unknown values are represented as `null` and added to `unresolved`.

## Example
Input:

> bhai wahi black hoodie 2 laga do, ek red XL bhi aur last wale address pe bhej dena

Expected interpretation:
- black hoodie: quantity 2
- red hoodie: quantity 1, size XL
- address: unresolved previous address reference
- payment method: unresolved

## Production AI layer
The deterministic parser in `lib/ai-parser.ts` is the local contract and fallback. A future LLM adapter must return the same `ParsedOrder` shape and validate its output with a schema before it reaches the detector.
