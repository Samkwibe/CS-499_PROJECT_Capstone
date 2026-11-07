/**
 * Seed FICTIONAL demo data so recruiters can explore the app.
 *
 * Safety rules:
 *  - Never deletes or overwrites existing records.
 *  - Demo accounts use the reserved example.com domain and are only created if missing.
 *  - Demo passwords come from environment variables (never hard-coded).
 *  - Requires the --confirm flag, and prints only the database NAME (never the URI).
 *  - Sample entries are only added when the database has no entries tagged as demo data.
 *
 * Usage (from snhu-foodwaste-backend/):
 *   DEMO_STUDENT_PASSWORD=... DEMO_STAFF_PASSWORD=... node scripts/seed-demo.js --confirm
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const FoodWasteEntry = require('../models/FoodWasteEntry');

const DEMO_TAG = '[demo data]';
const LOCATIONS = ['Dining Hall', 'Student Center Café', 'Athletics Snack Bar'];
const FOOD_TYPES = ['Bread', 'Vegetables', 'Fruit', 'Pasta', 'Dairy', 'Rice'];

async function ensureUser({ name, email, role, password }) {
  const existing = await User.findOne({ email });
  if (existing) return { user: existing, created: false };
  const user = await User.create({ name, email, role, password: await bcrypt.hash(password, 10) });
  return { user, created: true };
}

function sampleEntries(staffId) {
  const entries = [];
  const today = new Date();
  for (let day = 13; day >= 0; day -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - day);
    LOCATIONS.forEach((location, i) => {
      // Deterministic, clearly fictional values.
      const weight = Number((3 + ((day * 7 + i * 5) % 11) * 0.6).toFixed(1));
      entries.push({
        submittedBy: staffId,
        foodType: FOOD_TYPES[(day + i) % FOOD_TYPES.length],
        weight,
        date,
        location,
        notes: `${DEMO_TAG} Fictional sample record for demonstration.`,
        binFullness: 20 + ((day * 13 + i * 17) % 70),
        humidity: 40 + ((day + i) % 30),
        pH: Number((5.5 + ((day + i) % 3) * 0.5).toFixed(1)),
        compostWeight: Number((weight * 0.4).toFixed(1)),
        published: day % 4 !== 0
      });
    });
  }
  return entries;
}

async function main() {
  if (!process.argv.includes('--confirm')) {
    console.error('Refusing to run without --confirm. This adds fictional demo data to the configured database.');
    process.exit(1);
  }
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  const { DEMO_STUDENT_PASSWORD, DEMO_STAFF_PASSWORD } = process.env;
  if (!uri) throw new Error('MONGODB_URI is not set');
  if (!DEMO_STUDENT_PASSWORD || !DEMO_STAFF_PASSWORD) {
    throw new Error('Set DEMO_STUDENT_PASSWORD and DEMO_STAFF_PASSWORD (8+ characters each)');
  }
  if (DEMO_STUDENT_PASSWORD.length < 8 || DEMO_STAFF_PASSWORD.length < 8) {
    throw new Error('Demo passwords must be at least 8 characters');
  }

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  console.log(`Connected to database "${mongoose.connection.name}"`);

  const student = await ensureUser({ name: 'Demo Student', email: 'demo.student@example.com', role: 'student', password: DEMO_STUDENT_PASSWORD });
  const staff = await ensureUser({ name: 'Demo Staff', email: 'demo.staff@example.com', role: 'staff', password: DEMO_STAFF_PASSWORD });
  console.log(`Demo student: ${student.created ? 'created' : 'already existed (unchanged)'}`);
  console.log(`Demo staff:   ${staff.created ? 'created' : 'already existed (unchanged)'}`);

  const existingDemo = await FoodWasteEntry.countDocuments({ notes: { $regex: '^\\[demo data\\]' } });
  if (existingDemo > 0) {
    console.log(`Sample entries: ${existingDemo} demo entries already present, nothing added`);
  } else {
    const docs = await FoodWasteEntry.insertMany(sampleEntries(staff.user._id));
    console.log(`Sample entries: added ${docs.length} fictional entries`);
  }

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error('Seed failed:', err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
