# Equipment Rental Project — Database Design

## Sheets
`README`, `Equipment`, `Extras`, `Equipment_Extras`, `Bookings`, `Booking_Extras`, `Settings`, `Blocked_Dates`.

## Equipment
`equipment_id`, `name`, `short_description`, `description`, `price_per_day`, `deposit`, `rental_rules`, `image_url`, `image_alt_text`, `status`.

## Extras
`extra_id`, `name`, `description`, `price`, `unit`, `status`.

## Equipment_Extras
`equipment_id`, `extra_id`.

## Bookings
Customer: `booking_reference`, `customer_name`, `email`, `phone`.
Rental: `equipment_id`, `pickup_datetime`, `return_datetime`, `rental_days`, `returned_at`, `return_condition`.
Financial: `rental_amount`, `extras_amount`, `deposit_amount`, `total_amount`, `confirmation_payment_amount`, `payment_amount_received`.
Payment: `payment_status`, `payment_received_at`, `payment_updated_at`, `interac_payment_id`, `interac_security_question`, `interac_security_answer`.
Lifecycle: `booking_status`, `status_updated_at`, `created_at`, `cancelled_at`.
Deposit: `deposit_deduction_amount`, `deposit_deduction_reason`, `deposit_returned_amount`, `deposit_returned_at`.

## Booking_Extras
`booking_reference`, `extra_id`, `quantity`, `unit_price`, `amount`. Unit price is a historical snapshot.

## Settings
Interac email/ID; `buffer_hours=2`; `booking_start_hour=8`; `booking_end_hour=20`; Monday–Sunday Open; `pending_booking_hold_minutes=30`.

## Statuses
Booking: Pending, Confirmed, Cancelled, Refund, Completed. Payment: Pending, Paid, Refunded.

## Integrity
Stable IDs; numeric money; real Sheet datetimes; historical booking prices are snapshots; public lookup requires reference + matching contact; revisit retention of Interac security answer after verification.
