/** Equipment Rental - manual tests. */
function testReadConfiguration() {
  Logger.log(JSON.stringify(getSettings(), null, 2));
  Logger.log(JSON.stringify(getEquipment(), null, 2));
  Logger.log(JSON.stringify(getExtrasForEquipment('BG001'), null, 2));
}

function testPureOverlapRules() {
  const existingPickup = new Date('2026-08-20T10:00:00');
  const occupiedEnd = new Date('2026-08-20T18:00:00'); // return 4 PM + 2h buffer
  const cases = [
    ['direct overlap', new Date('2026-08-20T15:00:00'), new Date('2026-08-20T17:00:00'), true],
    ['inside buffer', new Date('2026-08-20T17:00:00'), new Date('2026-08-20T19:00:00'), true],
    ['exactly at buffer end', new Date('2026-08-20T18:00:00'), new Date('2026-08-20T19:00:00'), false],
  ];
  cases.forEach(([name, pickup, dropoff, expected]) => assertEquals_(name, expected, pickup < occupiedEnd && dropoff > existingPickup));
  Logger.log('Pure overlap tests passed.');
}

function testPricingRules() {
  const base = new Date('2026-08-20T10:00:00');
  const cases = [
    ['1 hour = 1 day', new Date('2026-08-20T11:00:00'), 1],
    ['23h59m = 1 day', new Date('2026-08-21T09:59:00'), 1],
    ['exactly 24 hours = 1 day', new Date('2026-08-21T10:00:00'), 1],
    ['24 hours + 1 minute = 2 days', new Date('2026-08-21T10:01:00'), 2],
    ['exactly 48 hours = 2 days', new Date('2026-08-22T10:00:00'), 2],
    ['48 hours + 1 minute = 3 days', new Date('2026-08-22T10:01:00'), 3],
  ];
  cases.forEach(([name, end, expected]) => assertEquals_(name, expected, calculateRentalDays(base, end)));
  const price = calculateBookingPrice('BG001', base, new Date('2026-08-21T10:01:00'), [{extra_id:'EX001', quantity:2}]);
  assertEquals_('rental days', 2, price.rental_days);
  assertEquals_('rental amount', 20, price.rental_amount);
  assertEquals_('extras amount', 6, price.extras_amount);
  assertEquals_('deposit amount', 50, price.deposit_amount);
  assertEquals_('total amount', 76, price.total_amount);
  assertEquals_('confirmation payment amount', 10, price.confirmation_payment_amount);
  Logger.log(JSON.stringify(price, null, 2));
  Logger.log('Pricing tests passed.');
}

function assertEquals_(name, expected, actual) {
  if (expected !== actual) throw new Error(`${name}: expected ${expected}, got ${actual}`);
  Logger.log(`PASS: ${name}`);
}
