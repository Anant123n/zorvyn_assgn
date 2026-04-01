const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const FinancialRecord = require('../models/FinancialRecord');

/**
 * Seed script — populates the database with sample data for testing.
 *
 * Creates:
 *   - 1 Admin user
 *   - 1 Analyst user
 *   - 1 Viewer user
 *   - 25+ sample financial records spanning 6 months
 *
 * Usage: npm run seed
 */

const users = [
  {
    name: 'Admin User',
    email: 'admin@financeapp.com',
    password: 'admin123',
    role: 'admin',
    status: 'active',
  },
  {
    name: 'Sarah Analyst',
    email: 'analyst@financeapp.com',
    password: 'analyst123',
    role: 'analyst',
    status: 'active',
  },
  {
    name: 'John Viewer',
    email: 'viewer@financeapp.com',
    password: 'viewer123',
    role: 'viewer',
    status: 'active',
  },
];

const generateRecords = (adminId) => {
  const records = [
    // ── January ──────────────────────────────────────────
    { amount: 8500, type: 'income', category: 'salary', date: new Date('2024-01-05'), description: 'Monthly salary - January', createdBy: adminId },
    { amount: 1200, type: 'expense', category: 'rent', date: new Date('2024-01-01'), description: 'Monthly rent payment', createdBy: adminId },
    { amount: 150, type: 'expense', category: 'utilities', date: new Date('2024-01-10'), description: 'Electricity and water bill', createdBy: adminId },
    { amount: 450, type: 'expense', category: 'food', date: new Date('2024-01-15'), description: 'Grocery shopping', createdBy: adminId },
    { amount: 2000, type: 'income', category: 'freelance', date: new Date('2024-01-20'), description: 'Freelance web development project', createdBy: adminId },

    // ── February ─────────────────────────────────────────
    { amount: 8500, type: 'income', category: 'salary', date: new Date('2024-02-05'), description: 'Monthly salary - February', createdBy: adminId },
    { amount: 1200, type: 'expense', category: 'rent', date: new Date('2024-02-01'), description: 'Monthly rent payment', createdBy: adminId },
    { amount: 180, type: 'expense', category: 'utilities', date: new Date('2024-02-10'), description: 'Electricity, water, and internet', createdBy: adminId },
    { amount: 500, type: 'expense', category: 'healthcare', date: new Date('2024-02-14'), description: 'Annual health checkup', createdBy: adminId },
    { amount: 300, type: 'expense', category: 'entertainment', date: new Date('2024-02-20'), description: 'Concert tickets', createdBy: adminId },

    // ── March ────────────────────────────────────────────
    { amount: 8500, type: 'income', category: 'salary', date: new Date('2024-03-05'), description: 'Monthly salary - March', createdBy: adminId },
    { amount: 1200, type: 'expense', category: 'rent', date: new Date('2024-03-01'), description: 'Monthly rent payment', createdBy: adminId },
    { amount: 160, type: 'expense', category: 'utilities', date: new Date('2024-03-10'), description: 'Utility bills', createdBy: adminId },
    { amount: 1500, type: 'income', category: 'investments', date: new Date('2024-03-15'), description: 'Stock dividend payout', createdBy: adminId },
    { amount: 800, type: 'expense', category: 'travel', date: new Date('2024-03-22'), description: 'Weekend trip to hills', createdBy: adminId },

    // ── April ────────────────────────────────────────────
    { amount: 9000, type: 'income', category: 'salary', date: new Date('2024-04-05'), description: 'Monthly salary - April (raise)', createdBy: adminId },
    { amount: 1200, type: 'expense', category: 'rent', date: new Date('2024-04-01'), description: 'Monthly rent payment', createdBy: adminId },
    { amount: 2500, type: 'expense', category: 'taxes', date: new Date('2024-04-15'), description: 'Quarterly tax payment', createdBy: adminId },
    { amount: 350, type: 'expense', category: 'subscriptions', date: new Date('2024-04-10'), description: 'SaaS tools and streaming services', createdBy: adminId },

    // ── May ──────────────────────────────────────────────
    { amount: 9000, type: 'income', category: 'salary', date: new Date('2024-05-05'), description: 'Monthly salary - May', createdBy: adminId },
    { amount: 1200, type: 'expense', category: 'rent', date: new Date('2024-05-01'), description: 'Monthly rent payment', createdBy: adminId },
    { amount: 3000, type: 'income', category: 'freelance', date: new Date('2024-05-18'), description: 'Mobile app consulting project', createdBy: adminId },
    { amount: 600, type: 'expense', category: 'shopping', date: new Date('2024-05-20'), description: 'New laptop accessories', createdBy: adminId },
    { amount: 200, type: 'expense', category: 'gifts', date: new Date('2024-05-25'), description: 'Birthday gift for friend', createdBy: adminId },

    // ── June ─────────────────────────────────────────────
    { amount: 9000, type: 'income', category: 'salary', date: new Date('2024-06-05'), description: 'Monthly salary - June', createdBy: adminId },
    { amount: 1200, type: 'expense', category: 'rent', date: new Date('2024-06-01'), description: 'Monthly rent payment', createdBy: adminId },
    { amount: 400, type: 'expense', category: 'education', date: new Date('2024-06-10'), description: 'Online course subscription', createdBy: adminId },
    { amount: 250, type: 'expense', category: 'insurance', date: new Date('2024-06-15'), description: 'Monthly insurance premium', createdBy: adminId },
    { amount: 100, type: 'expense', category: 'transportation', date: new Date('2024-06-20'), description: 'Monthly transit pass', createdBy: adminId },
  ];

  return records;
};

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seed...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data
    await User.deleteMany({});
    await FinancialRecord.deleteMany({});
    console.log('🗑️  Cleared existing data\n');

    // Create users (password hashing happens via pre-save hook)
    const createdUsers = [];
    for (const userData of users) {
      const user = await User.create(userData);
      createdUsers.push(user);
      console.log(`   👤 Created ${user.role}: ${user.email}`);
    }
    console.log('');

    // Create financial records
    const adminUser = createdUsers.find((u) => u.role === 'admin');
    const records = generateRecords(adminUser._id);
    await FinancialRecord.insertMany(records);
    console.log(`   💰 Created ${records.length} financial records\n`);

    // Summary
    console.log('━'.repeat(50));
    console.log('✅ Database seeded successfully!\n');
    console.log('📋 Test Credentials:');
    console.log('   Admin:   admin@financeapp.com   / admin123');
    console.log('   Analyst: analyst@financeapp.com / analyst123');
    console.log('   Viewer:  viewer@financeapp.com  / viewer123');
    console.log('━'.repeat(50));

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedDatabase();
