# Equipment Rental Project — Master Index

Read in this order for any new session/agent:
1. `00_MASTER_INDEX.md`
2. `01_HISTORY_AND_DECISIONS.md`
3. `02_SYSTEM_DESIGN.md`
4. `03_DATABASE_DESIGN.md`
5. `04_UI_DESIGN.md`
6. `05_SCRIPT_LOGIC.md`
7. `06_IMPLEMENTATION_STATUS.md`

## Update policy
After every material project change:
- append rationale/context to `01_HISTORY_AND_DECISIONS.md`;
- update affected live design docs (`02`–`05`);
- update `06_IMPLEMENTATION_STATUS.md` with progress and exact next step;
- never erase useful historical reasoning; record reversals as new history entries.

The live design docs represent current truth; history explains why it became that way.

## Source of truth
GitHub is now the canonical project source. Google Sheets remains the live datastore/admin interface and Google Apps Script remains the deployed backend runtime.
