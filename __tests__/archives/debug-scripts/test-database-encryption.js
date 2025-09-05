require("dotenv").config();
const { db: prisma } = require("./src/lib/database/client.ts");

async function testDatabaseOperations() {
  console.log("\n=== Testing Database Operations with Encryption ===");

  try {
    // Test 1: Create test users with encrypted PII
    console.log("\n1. Testing user creation with encrypted fields...");

    const testUsers = [
      {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@university.edu",
        phone: "+15551234567",
        userType: "STUDENT",
        communicationPreference: "BOTH",
      },
      {
        firstName: "Jane",
        lastName: "Smith",
        email: "jane.smith@alumni.edu",
        phone: "+15559876543",
        userType: "ALUMNI",
        communicationPreference: "EMAIL_ONLY",
      },
      {
        firstName: "Bob",
        lastName: "Johnson",
        email: "bob@techcorp.com",
        phone: "+15555551234",
        userType: "PROFESSIONAL",
        communicationPreference: "SMS_ONLY",
      },
    ];

    const createdUsers = [];

    for (const userData of testUsers) {
      console.log(
        `  Creating user: ${userData.firstName} ${userData.lastName}`
      );

      const user = await prisma.user.create({
        data: userData,
      });

      console.log(`  ✅ Created user with ID: ${user.id}`);
      console.log(`     User type: ${user.userType}`);
      console.log(
        `     Communication preference: ${user.communicationPreference}`
      );

      createdUsers.push(user);
    }

    // Test 2: Verify data is encrypted in database by checking raw storage
    console.log("\n2. Verifying encryption in database storage...");

    // Query raw database to check encryption
    const rawUsers = await prisma.$queryRaw`
      SELECT id, firstName_encrypted, firstName_hash, lastName_encrypted, lastName_hash,
             email_encrypted, email_hash, phone_encrypted, phone_hash, userType
      FROM "User" 
      WHERE id = ${createdUsers[0].id}
    `;

    if (rawUsers.length > 0) {
      const rawUser = rawUsers[0];
      console.log(`  ✅ Raw database storage verified:`);
      console.log(
        `     firstName_encrypted: ${rawUser.firstName_encrypted ? "Present" : "Missing"}`
      );
      console.log(
        `     firstName_hash: ${rawUser.firstName_hash ? rawUser.firstName_hash.substring(0, 16) + "..." : "Missing"}`
      );
      console.log(
        `     email_encrypted: ${rawUser.email_encrypted ? "Present" : "Missing"}`
      );
      console.log(
        `     email_hash: ${rawUser.email_hash ? rawUser.email_hash.substring(0, 16) + "..." : "Missing"}`
      );

      // Verify original data is NOT stored
      const hasPlaintext =
        JSON.stringify(rawUser).includes("John") ||
        JSON.stringify(rawUser).includes("john.doe@university.edu");
      if (!hasPlaintext) {
        console.log(
          `  ✅ Plaintext data not found in database - encryption working`
        );
      } else {
        console.log(
          `  ❌ Plaintext data found in database - encryption may be failing`
        );
      }
    }

    // Test 3: Test data retrieval and automatic decryption
    console.log("\n3. Testing data retrieval with automatic decryption...");

    for (const createdUser of createdUsers) {
      const retrievedUser = await prisma.user.findUnique({
        where: { id: createdUser.id },
      });

      if (retrievedUser) {
        console.log(
          `  ✅ Retrieved user: ${retrievedUser.firstName} ${retrievedUser.lastName}`
        );
        console.log(`     Email: ${retrievedUser.email}`);
        console.log(`     Phone: ${retrievedUser.phone}`);
        console.log(`     Type: ${retrievedUser.userType}`);
      } else {
        console.log(`  ❌ Failed to retrieve user with ID: ${createdUser.id}`);
      }
    }

    // Test 4: Test hash-based lookups
    console.log("\n4. Testing hash-based email lookups...");

    const emailToFind = "jane.smith@alumni.edu";
    const foundUser = await prisma.user.findFirst({
      where: { email: emailToFind },
    });

    if (foundUser) {
      console.log(
        `  ✅ Found user by email: ${foundUser.firstName} ${foundUser.lastName}`
      );
      console.log(`     Email matches: ${foundUser.email === emailToFind}`);
    } else {
      console.log(`  ❌ Failed to find user by email: ${emailToFind}`);
    }

    // Test 5: Create organizations and test relationships
    console.log("\n5. Testing organization creation and relationships...");

    const testOrg = await prisma.organization.create({
      data: {
        name: "Computer Science Club",
        description: "A club for CS students and enthusiasts",
        category: "ACADEMIC",
        contactEmail: "admin@csclub.edu",
        isPublic: true,
        maxMembers: 100,
      },
    });

    console.log(
      `  ✅ Created organization: ${testOrg.name} (ID: ${testOrg.id})`
    );

    // Test 6: Create subgroups
    console.log("\n6. Testing subgroup creation...");

    const testSubgroups = [
      {
        name: "Web Development Team",
        description: "Focus on web technologies",
        organizationId: testOrg.id,
        maxMembers: 25,
      },
      {
        name: "Data Science Group",
        description: "Machine learning and analytics",
        organizationId: testOrg.id,
        maxMembers: 30,
      },
    ];

    const createdSubgroups = [];
    for (const subgroupData of testSubgroups) {
      const subgroup = await prisma.subgroup.create({
        data: subgroupData,
      });
      console.log(
        `  ✅ Created subgroup: ${subgroup.name} (ID: ${subgroup.id})`
      );
      createdSubgroups.push(subgroup);
    }

    // Test 7: Test batch operations (25+ records)
    console.log("\n7. Testing batch operations with encryption...");

    const batchUsers = [];
    for (let i = 1; i <= 25; i++) {
      batchUsers.push({
        firstName: `BatchUser${i}`,
        lastName: `Test${i}`,
        email: `batch${i}@test.edu`,
        phone: `+1555000${String(i).padStart(4, "0")}`,
        userType: i % 2 === 0 ? "STUDENT" : "ALUMNI",
        communicationPreference:
          i % 3 === 0 ? "BOTH" : i % 3 === 1 ? "EMAIL_ONLY" : "SMS_ONLY",
      });
    }

    const startTime = Date.now();

    // Create users in batches of 5 to avoid overwhelming the database
    const batchSize = 5;
    const createdBatchUsers = [];

    for (let i = 0; i < batchUsers.length; i += batchSize) {
      const batch = batchUsers.slice(i, i + batchSize);
      const promises = batch.map((userData) =>
        prisma.user.create({ data: userData })
      );
      const results = await Promise.all(promises);
      createdBatchUsers.push(...results);
      console.log(
        `  ✅ Batch ${Math.floor(i / batchSize) + 1}: Created ${results.length} users`
      );
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`  ✅ Batch operation completed in ${duration}ms`);
    console.log(
      `  ✅ Average time per user: ${(duration / batchUsers.length).toFixed(2)}ms`
    );
    console.log(`  ✅ All ${batchUsers.length} users created successfully`);

    // Test 8: Cleanup - Remove test data
    console.log("\n8. Cleaning up test data...");

    const allTestUserIds = [
      ...createdUsers.map((u) => u.id),
      ...createdBatchUsers.map((u) => u.id),
    ];

    await prisma.user.deleteMany({
      where: { id: { in: allTestUserIds } },
    });

    await prisma.subgroup.deleteMany({
      where: { id: { in: createdSubgroups.map((s) => s.id) } },
    });

    await prisma.organization.delete({
      where: { id: testOrg.id },
    });

    console.log(
      `  ✅ Cleaned up ${allTestUserIds.length} users, ${createdSubgroups.length} subgroups, and 1 organization`
    );

    return {
      success: true,
      usersCreated: allTestUserIds.length,
      organizationsCreated: 1,
      subgroupsCreated: createdSubgroups.length,
      duration: duration,
    };
  } catch (error) {
    console.log(`❌ Database operation failed: ${error.message}`);
    console.error(error);
    return { success: false, error: error.message };
  }
}

// Main test function
async function runDatabaseTests() {
  console.log("🗄️ Starting Database Encryption Tests");
  console.log("====================================");

  try {
    // Test database connection first
    await prisma.$connect();
    console.log("✅ Connected to database successfully");

    const result = await testDatabaseOperations();

    if (result.success) {
      console.log("\n🎉 Database Encryption Test Complete!");
      console.log("====================================");
      console.log(`Users tested: ${result.usersCreated}`);
      console.log(`Organizations tested: ${result.organizationsCreated}`);
      console.log(`Subgroups tested: ${result.subgroupsCreated}`);
      console.log(`Total duration: ${result.duration}ms`);
    } else {
      console.log("\n❌ Database tests failed");
      console.log(`Error: ${result.error}`);
    }
  } catch (error) {
    console.error("💥 Test execution failed:", error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
    console.log("✅ Disconnected from database");
  }
}

// Run tests
runDatabaseTests().catch(console.error);
