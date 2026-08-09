# Equipment Rental Project — Apps Script Logic

## Implemented foundation
`Config.gs`, `DataAccess.gs`, `Availability.gs`, `Pricing.gs`, `Tests.gs`.

Data access reads Sheets by header names and trims headers/settings keys. Active equipment and linked active extras are exposed through helpers.

## Availability
Validate equipment active, pickup < return, not past, open day, within configured hours, not blocked, and not overlapping Pending/Confirmed booking. Existing occupied end = return + configured buffer. Pickup exactly at buffer end is allowed.

## Pricing
`rental_days = max(1, ceil(duration / 24h))`. Price is calculated server-side from current equipment/extras. Store historical extra unit prices when booking is created. Total = rental + extras + deposit. Confirmation payment = one day's rental price.

## Booking creation — next
Use `LockService`: validate payload → acquire lock → recheck availability → recalculate price → generate booking reference → append Bookings → append Booking_Extras → send admin email → return reference/status/payment instructions.

## Lookup/cancel
Lookup requires reference + matching normalized email/phone. Pending customer cancellation updates status/timestamps and immediately releases inventory.

## Security
Never trust client price or availability. Do not expose arbitrary Sheet data. Customer payment-detail submission must not mark payment Paid. Revisit stored Interac security answer.

## Tests verified
`testReadConfiguration()` passed live. `testPureOverlapRules()` passed direct overlap, inside-buffer, and exact-buffer-end cases. `testPricingRules()` is the next runtime test.
