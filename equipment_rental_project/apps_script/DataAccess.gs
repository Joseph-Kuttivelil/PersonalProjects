/** Equipment Rental - generic data access helpers. */
function getSpreadsheet_() {
  return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
}

function readTable(sheetName) {
  const sheet = getSpreadsheet_().getSheetByName(sheetName);
  if (!sheet) throw new Error(`Sheet not found: ${sheetName}`);
  const values = sheet.getDataRange().getValues();
  if (!values.length || !values[0].length) return [];
  const headers = values[0].map(h => String(h).trim());
  return values.slice(1)
    .filter(row => row.some(v => v !== '' && v !== null))
    .map(row => {
      const obj = {};
      headers.forEach((header, i) => { if (header) obj[header] = row[i]; });
      return obj;
    });
}

function getSettings() {
  return readTable(CONFIG.SHEETS.SETTINGS).reduce((acc, row) => {
    const key = String(row.setting || '').trim();
    if (key) acc[key] = row.value;
    return acc;
  }, {});
}

function getEquipment() {
  return readTable(CONFIG.SHEETS.EQUIPMENT)
    .filter(row => String(row.status || '').trim().toLowerCase() === 'active');
}

function getEquipmentById(equipmentId) {
  const id = String(equipmentId || '').trim();
  return getEquipment().find(row => String(row.equipment_id).trim() === id) || null;
}

function getExtrasForEquipment(equipmentId) {
  const id = String(equipmentId || '').trim();
  const links = readTable(CONFIG.SHEETS.EQUIPMENT_EXTRAS)
    .filter(row => String(row.equipment_id || '').trim() === id)
    .map(row => String(row.extra_id || '').trim());
  const allowedIds = new Set(links);
  return readTable(CONFIG.SHEETS.EXTRAS).filter(row =>
    allowedIds.has(String(row.extra_id || '').trim()) &&
    String(row.status || '').trim().toLowerCase() === 'active'
  );
}
