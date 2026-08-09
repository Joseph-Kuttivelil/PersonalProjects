/** Equipment Rental - availability logic. */
function checkAvailability(equipmentId, pickupInput, returnInput) {
  const equipment = getEquipmentById(equipmentId);
  if (!equipment) return unavailable_('Equipment is not active or does not exist.');
  const settings = getSettings();
  const pickup = toDate_(pickupInput);
  const dropoff = toDate_(returnInput);
  if (!pickup || !dropoff || isNaN(pickup.getTime()) || isNaN(dropoff.getTime())) return unavailable_('Invalid pickup or return date/time.');
  if (pickup >= dropoff) return unavailable_('Return must be after pickup.');
  if (pickup < new Date()) return unavailable_('Pickup cannot be in the past.');
  const hoursCheck = validateBusinessHours_(pickup, dropoff, settings);
  if (!hoursCheck.available) return hoursCheck;
  const blockedCheck = validateBlockedDates_(equipmentId, pickup, dropoff);
  if (!blockedCheck.available) return blockedCheck;
  const overlapCheck = validateBookingOverlap_(equipmentId, pickup, dropoff, settings);
  if (!overlapCheck.available) return overlapCheck;
  return { available: true, reason: '', pickup: formatDateTime_(pickup), return: formatDateTime_(dropoff) };
}

function validateBusinessHours_(pickup, dropoff, settings) {
  const startHour = Number(settings.booking_start_hour);
  const endHour = Number(settings.booking_end_hour);
  if (!Number.isFinite(startHour) || !Number.isFinite(endHour)) return unavailable_('Business hours are not configured correctly.');
  for (const item of [{date: pickup, label: 'Pickup'}, {date: dropoff, label: 'Return'}]) {
    if (String(settings[dayKey_(item.date)] || '').trim().toLowerCase() !== 'open') return unavailable_(`${item.label} falls on a closed day.`);
    const local = getLocalParts_(item.date);
    const hour = local.hour + local.minute / 60;
    if (hour < startHour || hour > endHour) return unavailable_(`${item.label} must be between ${formatHour_(startHour)} and ${formatHour_(endHour)}.`);
  }
  return { available: true, reason: '' };
}

function validateBlockedDates_(equipmentId, pickup, dropoff) {
  for (const row of readTable(CONFIG.SHEETS.BLOCKED_DATES)) {
    if (String(row.status || '').trim().toLowerCase() !== 'blocked') continue;
    const blockedDate = toDate_(row.date || row.blocked_date);
    if (!blockedDate || isNaN(blockedDate.getTime())) continue;
    const rowEquipment = String(row.equipment_id || '').trim();
    if (rowEquipment && rowEquipment !== String(equipmentId).trim()) continue;
    const day = formatDate_(blockedDate);
    if (day === formatDate_(pickup) || day === formatDate_(dropoff) || (blockedDate > startOfDay_(pickup) && blockedDate < startOfDay_(dropoff))) return unavailable_('The selected rental period includes a blocked date.');
  }
  return { available: true, reason: '' };
}

function validateBookingOverlap_(equipmentId, pickup, dropoff, settings) {
  const bufferHours = Number(settings.buffer_hours || 0);
  const bufferMs = bufferHours * 60 * 60 * 1000;
  const occupyingStatuses = new Set(['pending', 'confirmed']);
  for (const booking of readTable(CONFIG.SHEETS.BOOKINGS)) {
    if (String(booking.equipment_id || '').trim() !== String(equipmentId).trim()) continue;
    if (!occupyingStatuses.has(String(booking.booking_status || '').trim().toLowerCase())) continue;
    const existingPickup = toDate_(booking.pickup_datetime);
    const existingReturn = toDate_(booking.return_datetime);
    if (!existingPickup || !existingReturn || isNaN(existingPickup.getTime()) || isNaN(existingReturn.getTime())) continue;
    const occupiedEnd = new Date(existingReturn.getTime() + bufferMs);
    if (pickup.getTime() < occupiedEnd.getTime() && dropoff.getTime() > existingPickup.getTime()) return unavailable_(`Equipment is already reserved during this period or its ${bufferHours}-hour buffer.`);
  }
  return { available: true, reason: '' };
}

function toDate_(value) { if (value instanceof Date) return new Date(value.getTime()); if (value === null || value === undefined || value === '') return null; return new Date(value); }
function getLocalParts_(date) { return { hour: Number(Utilities.formatDate(date, CONFIG.TIME_ZONE, 'H')), minute: Number(Utilities.formatDate(date, CONFIG.TIME_ZONE, 'm')) }; }
function dayKey_(date) { return Utilities.formatDate(date, CONFIG.TIME_ZONE, 'EEEE').toLowerCase(); }
function formatDate_(date) { return Utilities.formatDate(date, CONFIG.TIME_ZONE, 'yyyy-MM-dd'); }
function formatDateTime_(date) { return Utilities.formatDate(date, CONFIG.TIME_ZONE, "yyyy-MM-dd'T'HH:mm:ssXXX"); }
function formatHour_(hour) { const suffix = hour >= 12 ? 'PM' : 'AM'; let h = hour % 12; if (h === 0) h = 12; return `${h}:00 ${suffix}`; }
function startOfDay_(date) { const text = Utilities.formatDate(date, CONFIG.TIME_ZONE, 'yyyy-MM-dd'); return new Date(`${text}T00:00:00`); }
function unavailable_(reason) { return { available: false, reason }; }
