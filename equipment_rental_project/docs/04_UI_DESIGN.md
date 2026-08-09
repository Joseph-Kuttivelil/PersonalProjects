# Equipment Rental Project — UI Design

## Entry
Primary: Rent Equipment. Secondary: Check Booking Status using booking reference + email or phone.

## Screen 1 — Equipment
Card: photo, name, short description, `$10/day`, View Details. Details modal: larger photo, full description, price/day, deposit, linked extras, rules, Rent This.

## Screen 2 — Date/time + extras
Pickup date/time, return date/time, extra quantity controls. Past/closed/blocked/unavailable options disabled. Current availability: all days, 8 AM–8 PM. 2-hour buffer reflected in availability. Time granularity initially hourly; can be refined.

## Screen 3 — Review
Show equipment, pickup/return, rental calculation, extras lines, deposit, total, amount required to confirm. Rules open in modal. Collect name/email/phone. Server rechecks availability and price before creation.

## Screen 4 — Status/payment
Show reference, equipment, pickup/return, total, confirmation amount and status timeline. Pending shows Interac ID/email plus fields for payment ID/security question/security answer. Customer-provided payment details do not automatically mark payment Paid; admin verifies.

## Cancellation
Only Pending bookings expose Cancel Booking; require confirmation modal. Confirmed bookings require contacting owner.

## Admin
Version 1 admin UI is Google Sheets.

## Open UI decisions
Branding/style, exact time increment, exact required contact fields, completed/refund presentation, and durable image-hosting approach.
