// utils/generateOrderNumber.js
// Generates a human-readable, reasonably-unique order number like HOJ-2026-4831

function generateOrderNumber() {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000); // 4-digit random
  const timestampTail = Date.now().toString().slice(-4);
  return `HOJ-${year}-${random}${timestampTail}`.slice(0, 24);
}

module.exports = generateOrderNumber;
