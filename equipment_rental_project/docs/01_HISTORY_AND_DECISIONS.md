# Equipment Rental Project — History & Decisions

Append-only project rationale.

## Architecture
Calendly did not fit the rental workflow; Firebase and Shopify were rejected. Chosen stack: plain HTML/CSS/JS on Cloudflare Pages, Google Apps Script backend, Google Sheets datastore/admin. Reason: custom flow, minimal infrastructure, near-zero recurring cost.

## UI/data decisions
Equipment is data-driven. Cards show photo/name/short description/price per day; details show description, deposit, extras and rules. Extras use a many-to-many `Equipment_Extras` relationship. Rules remain multiline text on Equipment. Booking extras preserve quantity and historical unit price.

## Availability
Unavailable dates/times are disabled. Current business availability is all 7 days, 8 AM–8 PM. A 2-hour post-return buffer applies. `Blocked_Dates` supports owner/maintenance blocks. `pending_booking_hold_minutes` is 30; automatic expiry is deferred.

## Booking/status
No customer accounts. Existing booking lookup requires booking reference plus matching email or phone. Customer may self-cancel only while Pending. Booking statuses: Pending, Confirmed, Cancelled, Refund, Completed. Payment statuses: Pending, Paid, Refunded.

## Payment/deposit
Initial equipment: Bissell Little Green Pro (`BG001`), $10/day, $50 deposit. Solution 2oz (`EX001`) is $3/bottle. Confirmation payment is one day's rental fee; remaining amount is paid at pickup. Interac is manually verified by admin. Deposit deductions/return amounts are stored on Bookings; no separate deposit status yet.

## Rental billing rule
Finalized 2026-08-09: bill every started 24-hour block, minimum one day. 1 hour = 1 day; exactly 24 hours = 1 day; 24h01m = 2 days; exactly 48h = 2 days; 48h01m = 3 days.

## Runtime verification
Apps Script and Sheet timezones changed to Vancouver. `testReadConfiguration()` passed against live Sheets. `testPureOverlapRules()` passed direct overlap, buffer overlap, and exact-buffer-end allowance.

## Repository decision
2026-08-09: GitHub becomes canonical source for project docs and source code. Apps Script deployment remains separate and will be synchronized with `clasp` from the repository/local checkout.
