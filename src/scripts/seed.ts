// scripts/seed.ts
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

dotenv.config();

// Import models
import {UserModel,DocumentModel,TagModel,DocumentTagModel } from "../models/index";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/docmanager";

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
}

async function clearDatabase() {
  console.log("\n🗑️  Clearing existing data...");
  await UserModel.deleteMany({});
  await DocumentModel.deleteMany({});
  await TagModel.deleteMany({});
  await DocumentTagModel.deleteMany({});
  console.log("✅ Database cleared");
}

async function seedUsers() {
  console.log("\n👥 Seeding users...");

  const users = await UserModel.create([
    {
      email: "admin@test.com",
      role: "admin",
    },
    {
      email: "user1@test.com",
      role: "user",
    },
    {
      email: "user2@test.com",
      role: "user",
    },
    {
      email: "support@test.com",
      role: "support",
    },
    {
      email: "moderator@test.com",
      role: "moderator",
    },
  ]);

  console.log(`✅ Created ${users.length} users:`);
  users.forEach((user) => {
    console.log(`   - ${user.email} (${user.role})`);
  });

  return users;
}

async function seedTags(users: any[]) {
  console.log("\n🏷️  Seeding tags...");

  const user1 = users.find((u) => u.email === "user1@test.com");
  const user2 = users.find((u) => u.email === "user2@test.com");

  const tags = await TagModel.create([
    // User 1 tags
    { name: "invoices-2025", ownerId: user1._id },
    { name: "contracts", ownerId: user1._id },
    { name: "receipts", ownerId: user1._id },
    { name: "vendor-acme", ownerId: user1._id },
    { name: "vendor-techcorp", ownerId: user1._id },
    { name: "paid", ownerId: user1._id },
    { name: "pending", ownerId: user1._id },
    { name: "generated", ownerId: user1._id },

    // User 2 tags
    { name: "invoices-2025", ownerId: user2._id },
    { name: "receipts", ownerId: user2._id },
    { name: "personal", ownerId: user2._id },
  ]);

  console.log(`✅ Created ${tags.length} tags`);
  return tags;
}

async function seedDocuments(users: any[], tags: any[]) {
  console.log("\n📄 Seeding documents...");

  const user1 = users.find((u) => u.email === "user1@test.com");
  const user2 = users.find((u) => u.email === "user2@test.com");

  // Ensure uploads directory exists
  const uploadDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Sample documents for User 1
  const user1Docs = [
    {
      filename: "invoice_acme_jan.txt",
      content: "INVOICE #001\nVendor: ACME Corp\nAmount: $1,500\nDue Date: 2025-01-15",
      primaryTag: "invoices-2025",
      secondaryTags: ["vendor-acme", "paid"],
    },
    {
      filename: "invoice_techcorp_jan.txt",
      content: "INVOICE #002\nVendor: TechCorp Inc\nAmount: $2,300\nDue Date: 2025-01-20",
      primaryTag: "invoices-2025",
      secondaryTags: ["vendor-techcorp", "pending"],
    },
    {
      filename: "contract_acme_2025.txt",
      content:
        "SERVICE AGREEMENT\nBetween: Company A and ACME Corp\nTerm: 12 months\nValue: $50,000",
      primaryTag: "contracts",
      secondaryTags: ["vendor-acme"],
    },
    {
      filename: "receipt_office_supplies.txt",
      content: "RECEIPT\nStore: Office Depot\nDate: 2025-01-10\nTotal: $127.50",
      primaryTag: "receipts",
      secondaryTags: [],
    },
  ];

  // Sample documents for User 2
  const user2Docs = [
    {
      filename: "invoice_rent_jan.txt",
      content: "RENT INVOICE\nProperty: 123 Main St\nAmount: $1,200\nDue: 2025-01-01",
      primaryTag: "invoices-2025",
      secondaryTags: ["personal"],
    },
    {
      filename: "receipt_grocery.txt",
      content: "GROCERY RECEIPT\nStore: Walmart\nDate: 2025-01-08\nTotal: $87.23",
      primaryTag: "receipts",
      secondaryTags: ["personal"],
    },
  ];

  const documents = [];

  // Create User 1 documents
  for (const docData of user1Docs) {
    const filePath = path.join(uploadDir, docData.filename);
    fs.writeFileSync(filePath, docData.content);

    const doc = await DocumentModel.create({
      ownerId: user1._id,
      filename: docData.filename,
      mime: "text/plain",
      textContent: docData.content,
      fileUrl: `/uploads/${docData.filename}`,
    });

    // Attach primary tag
    const primaryTag = tags.find(
      (t) => t.name === docData.primaryTag && t.ownerId.equals(user1._id)
    );
    await DocumentTagModel.create({
      documentId: doc._id,
      tagId: primaryTag._id,
      isPrimary: true,
    });

    // Attach secondary tags
    for (const tagName of docData.secondaryTags) {
      const secondaryTag = tags.find(
        (t) => t.name === tagName && t.ownerId.equals(user1._id)
      );
      if (secondaryTag) {
        await DocumentTagModel.create({
          documentId: doc._id,
          tagId: secondaryTag._id,
          isPrimary: false,
        });
      }
    }

    documents.push(doc);
  }

  // Create User 2 documents
  for (const docData of user2Docs) {
    const filePath = path.join(uploadDir, docData.filename);
    fs.writeFileSync(filePath, docData.content);

    const doc = await DocumentModel.create({
      ownerId: user2._id,
      filename: docData.filename,
      mime: "text/plain",
      textContent: docData.content,
      fileUrl: `/uploads/${docData.filename}`,
    });

    // Attach primary tag
    const primaryTag = tags.find(
      (t) => t.name === docData.primaryTag && t.ownerId.equals(user2._id)
    );
    await DocumentTagModel.create({
      documentId: doc._id,
      tagId: primaryTag._id,
      isPrimary: true,
    });

    // Attach secondary tags
    for (const tagName of docData.secondaryTags) {
      const secondaryTag = tags.find(
        (t) => t.name === tagName && t.ownerId.equals(user2._id)
      );
      if (secondaryTag) {
        await DocumentTagModel.create({
          documentId: doc._id,
          tagId: secondaryTag._id,
          isPrimary: false,
        });
      }
    }

    documents.push(doc);
  }

  console.log(`✅ Created ${documents.length} documents with tags`);
  return documents;
}

async function displaySummary(users: any[]) {
  console.log("\n" + "=".repeat(60));
  console.log("📊 SEED SUMMARY");
  console.log("=".repeat(60));

  for (const user of users) {
    console.log(`\n👤 ${user.email} (${user.role})`);
    console.log(`   ID: ${user._id}`);

    const tags = await TagModel.find({ ownerId: user._id });
    const docs = await DocumentModel.find({ ownerId: user._id });

    console.log(`   Tags: ${tags.length}`);
    console.log(`   Documents: ${docs.length}`);

    // Get webhook URL
    const webhookUrl = `http://localhost:3000/v1/webhooks/ocr/${user._id}`;
    console.log(`   Webhook URL: ${webhookUrl}`);
  }

  console.log("\n" + "=".repeat(60));
  console.log("🚀 Ready to test!");
  console.log("=".repeat(60));
}

async function seed() {
  try {
    await connectDB();
    await clearDatabase();

    const users = await seedUsers();
    const tags = await seedTags(users);
    const documents = await seedDocuments(users, tags);

    await displaySummary(users);

    console.log("✅ Seeding completed successfully!\n");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("👋 Database connection closed");
  }
}

// Run seed
seed();