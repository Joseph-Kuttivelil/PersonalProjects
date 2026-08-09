# Equipment Rental Project

Small equipment-rental booking system designed for near-zero recurring cost.

## Stack
- Google Sheets — datastore and initial admin interface
- Google Apps Script — backend/business logic and email
- Plain HTML/CSS/JavaScript — planned customer UI
- Cloudflare Pages — planned frontend hosting

## Start here
Read the project documentation in this order:
1. `docs/00_MASTER_INDEX.md`
2. `docs/01_HISTORY_AND_DECISIONS.md`
3. `docs/02_SYSTEM_DESIGN.md`
4. `docs/03_DATABASE_DESIGN.md`
5. `docs/04_UI_DESIGN.md`
6. `docs/05_SCRIPT_LOGIC.md`
7. `docs/06_IMPLEMENTATION_STATUS.md`

## Current implementation
The live Google Sheet schema has been validated. The Apps Script project is connected to the sheet and the data-access and overlap tests have passed. The current implementation milestone is pricing, followed by booking creation.

### Rental pricing rule
Billing is by started 24-hour blocks with a one-day minimum:
- 1 hour = 1 day
- exactly 24 hours = 1 day
- 24 hours + 1 minute = 2 days
- exactly 48 hours = 2 days
- 48 hours + 1 minute = 3 days

## Apps Script
The live Apps Script project is named `EquipmentRental`.

The `apps_script/.clasp.json` file contains the Apps Script project ID so the local source can later be synchronized with `clasp`.
