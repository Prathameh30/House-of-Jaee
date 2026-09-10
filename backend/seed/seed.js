// seed/seed.js
// Run with: npm run seed
// This script:
//  1. Connects to the DB (schema.sql + seed.sql must already be run for categories/products/orders).
//  2. Ensures a working admin account exists with a correctly-hashed password,
//     since static bcrypt hashes can't be safely hardcoded into seed.sql.
//  3. Creates a demo customer account so you can test customer login immediately.

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const bcrypt = require("bcryptjs");
const { pool } = require("../config/db");

async function seedAdmin() {
  const name = process.env.SEED_ADMIN_NAME || "Jaee Patil";
  const email = (
    process.env.SEED_ADMIN_EMAIL || "admin@houseofjaee.com"
  ).toLowerCase();
  const plainPassword = process.env.SEED_ADMIN_PASSWORD || "Admin@123";

  const [existing] = await pool.query(
    "SELECT admin_id FROM admins WHERE email = ?",
    [email],
  );

  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  if (existing.length > 0) {
    await pool.query(
      "UPDATE admins SET password = ?, name = ? WHERE email = ?",
      [hashedPassword, name, email],
    );
    console.log(`🔄 Updated existing admin account: ${email}`);
  } else {
    await pool.query(
      "INSERT INTO admins (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, "ADMIN"],
    );
    console.log(`✅ Created admin account: ${email}`);
  }
  console.log(`   Login with → email: ${email} | password: ${plainPassword}`);
}

async function seedDemoCustomer() {
  const email = "demo.customer@example.com";
  const plainPassword = "Customer@123";

  const [existing] = await pool.query(
    "SELECT customer_id FROM customers WHERE email = ?",
    [email],
  );
  if (existing.length > 0) {
    console.log(`ℹ️  Demo customer already exists: ${email}`);
    return;
  }

  const hashedPassword = await bcrypt.hash(plainPassword, 10);
  await pool.query(
    "INSERT INTO customers (name, email, password, mobile_number) VALUES (?, ?, ?, ?)",
    ["Demo Customer", email, hashedPassword, "9999999999"],
  );
  console.log(`✅ Created demo customer account: ${email}`);
  console.log(`   Login with → email: ${email} | password: ${plainPassword}`);
}

(async () => {
  try {
    console.log("🌱 Seeding House of Jaee admin & demo accounts...\n");
    await seedAdmin();
    await seedDemoCustomer();
    console.log("\n🌸 Seeding complete!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
})();
