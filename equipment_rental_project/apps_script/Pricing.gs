/** Equipment Rental - pricing logic. */
function calculateRentalDays(pickupInput, returnInput) {
  const pickup = toDate_(pickupInput);
  const dropoff = toDate_(returnInput);
  if (!pickup || !dropoff || isNaN(pickup.getTime()) || isNaN(dropoff.getTime())) throw new Error('Invalid pickup or return date/time.');
  const durationMs = dropoff.getTime() - pickup.getTime();
  if (durationMs <= 0) throw new Error('Return must be after pickup.');
  const DAY_MS = 24 * 60 * 60 * 1000;
  return Math.max(1, Math.ceil(durationMs / DAY_MS));
}

function calculateBookingPrice(equipmentId, pickupInput, returnInput, selectedExtras) {
  const equipment = getEquipmentById(equipmentId);
  if (!equipment) throw new Error('Equipment is not active or does not exist.');
  const rentalDays = calculateRentalDays(pickupInput, returnInput);
  const pricePerDay = Number(equipment.price_per_day);
  if (!Number.isFinite(pricePerDay) || pricePerDay < 0) throw new Error('Equipment daily price is invalid.');
  const rentalAmount = roundMoney_(rentalDays * pricePerDay);
  const depositAmount = roundMoney_(Number(equipment.deposit || 0));
  const extrasById = {};
  getExtrasForEquipment(equipmentId).forEach(extra => { extrasById[String(extra.extra_id).trim()] = extra; });
  const extras = [];
  let extrasAmount = 0;
  (selectedExtras || []).forEach(selection => {
    const extraId = String(selection.extra_id || '').trim();
    const quantity = Number(selection.quantity || 0);
    if (!extraId || quantity <= 0) return;
    if (!Number.isInteger(quantity)) throw new Error(`Quantity for ${extraId} must be a whole number.`);
    const extra = extrasById[extraId];
    if (!extra) throw new Error(`Extra ${extraId} is not available for equipment ${equipmentId}.`);
    const unitPrice = Number(extra.price);
    if (!Number.isFinite(unitPrice) || unitPrice < 0) throw new Error(`Invalid price for extra ${extraId}.`);
    const amount = roundMoney_(quantity * unitPrice);
    extrasAmount += amount;
    extras.push({ extra_id: extraId, name: extra.name, quantity, unit_price: roundMoney_(unitPrice), amount });
  });
  extrasAmount = roundMoney_(extrasAmount);
  const totalAmount = roundMoney_(rentalAmount + extrasAmount + depositAmount);
  return {
    equipment_id: String(equipment.equipment_id), equipment_name: equipment.name,
    rental_days: rentalDays, price_per_day: roundMoney_(pricePerDay), rental_amount: rentalAmount,
    extras, extras_amount: extrasAmount, deposit_amount: depositAmount, total_amount: totalAmount,
    confirmation_payment_amount: roundMoney_(pricePerDay)
  };
}

function roundMoney_(value) { return Math.round((Number(value) + Number.EPSILON) * 100) / 100; }
