# Equipment Rental Project — Implementation Status

## Completed
- Architecture and customer/admin flows designed.
- Live Google Sheet schema validated and corrected.
- Sheet + Apps Script timezone set to Vancouver.
- Apps Script project `EquipmentRental` created.
- Data access installed and verified against live Sheets.
- Availability overlap/buffer logic installed and pure tests passed.
- Pricing module implemented in repository.
- GitHub established as canonical source.

## Current business rules
Bissell Little Green Pro BG001: $10/day, $50 deposit. Solution EX001: $3/bottle. Open 7 days, 8 AM–8 PM. 2-hour post-return buffer. Confirmation payment = one day's rental fee. Rental billing = every started 24-hour block, minimum 1 day. Customer self-cancel only while Pending.

## Next verification
Sync/add `Pricing.gs` and updated `Tests.gs` to the live Apps Script project and run `testPricingRules()`.

Expected pricing boundaries:
- 1h → 1 day
- exactly 24h → 1 day
- 24h01m → 2 days
- exactly 48h → 2 days
- 48h01m → 3 days

## Next implementation milestone
After pricing tests pass, implement booking creation with `LockService`, server-side availability/price recheck, booking-reference generation, Bookings + Booking_Extras writes, Pending statuses, and admin email.

## Handoff
Do not restart requirements discovery. Read docs in the order in `00_MASTER_INDEX.md`, inspect current repo code, and continue from the next verification/milestone above.
