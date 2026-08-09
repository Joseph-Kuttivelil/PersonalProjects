# Equipment Rental Project — System Design

## Architecture
Customer browser → Cloudflare Pages (plain HTML/CSS/JS) → Google Apps Script → Google Sheets + admin email.

## New booking flow
Browse equipment → details → select pickup/return → extras → review costs/rules → enter contact → create Pending booking → show reference + Interac instructions → customer supplies payment-identification details → admin verifies → Paid + Confirmed → return → Completed + deposit reconciliation.

## Lookup/cancel
Existing booking requires reference + matching email or phone. Customer self-cancel is allowed only while Pending. Confirmed cancellation/refund is owner-controlled.

## Availability
All 7 days currently Open, 8 AM–8 PM. Apply 2-hour buffer after return. Pending and Confirmed occupy inventory. Cancelled does not. Whole-day Blocked_Dates supported initially. Pending hold configured at 30 minutes; auto-expiry deferred.

## Payment
`total_amount = rental_amount + extras_amount + deposit_amount`. Confirmation payment is one day's rental price. `payment_amount_received` records actual verified amount. Interac verification is manual.

## Billing
Bill every started 24-hour block, minimum one day: `max(1, ceil(duration / 24h))`.

## Timezone
All booking logic uses `America/Vancouver`; both live Sheet and Apps Script project are configured to Vancouver.

## Initial equipment
Bissell Little Green Pro: BG001, $10/day, $50 deposit. Solution 2oz: EX001, $3/bottle.

## Deferred
Pending auto-expiry, Messenger, dedicated admin UI, customer accounts, automated Interac verification, card/SMS payments, advanced payment ledger.
