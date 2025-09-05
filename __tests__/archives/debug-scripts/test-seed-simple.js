/**
 * Simple test seed without encryption middleware
 * Tests basic database operations and schema
 */

const { Client } = require("pg");

const connectionString =
  "postgresql://postgres.mnyqqtucxkuirmgpgxxz:42sLxm4JVAbsxJW@aws-1-us-east-2.pooler.supabase.com:6543/postgres";

console.log("🌱 Testing basic database operations...");

async function testDatabaseOperations() {
  const client = new Client({
    connectionString: connectionString,
    connectionTimeoutMillis: 15000,
    query_timeout: 10000,
  });

  try {
    await client.connect();
    console.log("✅ Connected to database");

    // Check what columns exist in organizations table
    const orgColumns = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'organizations' 
      ORDER BY ordinal_position
    `);
    console.log("📋 Organizations table columns:");
    orgColumns.rows.forEach((row) => {
      console.log(
        `  - ${row.column_name}: ${row.data_type} (${row.is_nullable})`
      );
    });

    // Test creating a user with encrypted fields
    console.log("👤 Creating test user...");
    const userId = "test_user_" + Date.now();
    await client.query(
      `
      INSERT INTO users (
        id, 
        "firstName_encrypted", 
        "firstName_hash",
        "lastName_encrypted", 
        "lastName_hash",
        "email_encrypted", 
        "email_hash",
        "phone_encrypted",
        "phone_hash",
        "userType",
        role,
        "communicationPreference",
        "isEmailVerified",
        "isPhoneVerified",
        "isActive"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
      )
    `,
      [
        userId,
        "encrypted_john_placeholder",
        "hash_john_placeholder",
        "encrypted_smith_placeholder",
        "hash_smith_placeholder",
        "encrypted_email_placeholder",
        "hash_email_placeholder",
        "encrypted_phone_placeholder",
        "hash_phone_placeholder",
        "STUDENT",
        "CLIENT",
        "BOTH",
        true,
        true,
        true,
      ]
    );

    console.log("✅ User created successfully");

    // Test creating an organization
    console.log("🏢 Creating test organization...");
    const orgId = "test_org_" + Date.now();
    await client.query(
      `
      INSERT INTO organizations (
        id,
        name,
        description,
        code,
        "adminId",
        "isActive",
        "allowFollows",
        "requireApproval",
        "smsCreditsAvailable"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `,
      [
        orgId,
        "Test Organization",
        "A test organization for database validation",
        "TEST1234",
        userId,
        true,
        true,
        true,
        100,
      ]
    );

    console.log("✅ Organization created successfully");

    // Test creating a subgroup
    console.log("📊 Creating test subgroup...");
    const subgroupId = "test_subgroup_" + Date.now();
    await client.query(
      `
      INSERT INTO subgroups (
        id,
        "organizationId", 
        name,
        description
      ) VALUES ($1, $2, $3, $4)
    `,
      [subgroupId, orgId, "Test Subgroup", "A test subgroup"]
    );

    console.log("✅ Subgroup created successfully");

    // Test creating student info
    console.log("🎓 Creating student info...");
    const studentInfoId = "test_student_info_" + Date.now();
    await client.query(
      `
      INSERT INTO student_info (
        id,
        "userId",
        "studentId_encrypted",
        "studentId_hash", 
        "major_encrypted",
        "major_hash",
        "graduationYear",
        gpa
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `,
      [
        studentInfoId,
        userId,
        "encrypted_studentid_placeholder",
        "hash_studentid_placeholder",
        "encrypted_major_placeholder",
        "hash_major_placeholder",
        2025,
        3.8,
      ]
    );

    console.log("✅ Student info created successfully");

    // Test creating a follow relationship
    console.log("🔗 Creating follow relationship...");
    const followId = "test_follow_" + Date.now();
    await client.query(
      `
      INSERT INTO org_follows (
        id,
        "userId",
        "organizationId",
        status
      ) VALUES ($1, $2, $3, $4)
    `,
      [followId, userId, orgId, "APPROVED"]
    );

    console.log("✅ Follow relationship created successfully");

    // Test creating user-subgroup relationship
    console.log("👥 Creating user-subgroup relationship...");
    const userSubgroupId = "test_user_subgroup_" + Date.now();
    await client.query(
      `
      INSERT INTO user_subgroups (
        id,
        "userId",
        "subgroupId"
      ) VALUES ($1, $2, $3)
    `,
      [userSubgroupId, userId, subgroupId]
    );

    console.log("✅ User-subgroup relationship created successfully");

    // Test querying data
    console.log("📋 Testing data retrieval...");
    const userResult = await client.query(
      'SELECT id, "userType", role FROM users WHERE id = $1',
      [userId]
    );
    const orgResult = await client.query(
      "SELECT id, name FROM organizations WHERE id = $1",
      [orgId]
    );
    const subgroupResult = await client.query(
      "SELECT id, name FROM subgroups WHERE id = $1",
      [subgroupId]
    );

    console.log("📊 Query results:");
    console.log(
      `  User: ${userResult.rows[0].id} (${userResult.rows[0].userType}, ${userResult.rows[0].role})`
    );
    console.log(
      `  Organization: ${orgResult.rows[0].id} (${orgResult.rows[0].name})`
    );
    console.log(
      `  Subgroup: ${subgroupResult.rows[0].id} (${subgroupResult.rows[0].name})`
    );

    console.log("🎉 All database operations completed successfully!");
    console.log(
      "✅ Schema validation passed - all tables and relationships working"
    );
  } catch (error) {
    console.log("❌ Database operation failed!");
    console.log(`Error: ${error.message}`);
    throw error;
  } finally {
    await client.end();
  }
}

testDatabaseOperations().catch(console.error);
