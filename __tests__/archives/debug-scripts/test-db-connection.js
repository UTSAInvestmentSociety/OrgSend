/**
 * Database connection test script
 * Tests direct connection to Supabase PostgreSQL database
 */

const { Client } = require("pg");

// Test with updated pooler connection string from .env
const connectionString =
  "postgresql://postgres.mnyqqtucxkuirmgpgxxz:42sLxm4JVAbsxJW@aws-1-us-east-2.pooler.supabase.com:6543/postgres";

console.log("🔍 Database Connection Test");
console.log("═════════════════════════════");
console.log(
  `Connection String: ${connectionString ? connectionString.replace(/:([^:@]+)@/, ":***@") : "NOT SET"}`
);
console.log("");

async function testConnection() {
  if (!connectionString) {
    console.log("❌ ERROR: DATABASE_URL not found in environment variables");
    return;
  }

  const client = new Client({
    connectionString: connectionString,
    connectionTimeoutMillis: 15000,
    query_timeout: 10000,
    ssl: {
      rejectUnauthorized: false, // Allow self-signed certificates for Supabase
    },
  });

  try {
    console.log("🔌 Attempting to connect...");
    await client.connect();
    console.log("✅ Connected successfully!");

    console.log("🔍 Testing query execution...");
    const result = await client.query(
      "SELECT NOW() as current_time, version() as pg_version"
    );
    console.log("✅ Query executed successfully!");
    console.log(`📅 Server Time: ${result.rows[0].current_time}`);
    console.log(
      `🐘 PostgreSQL Version: ${result.rows[0].pg_version.split(" ")[0]}`
    );

    // Test schema query
    console.log("🔍 Checking existing tables...");
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    if (tablesResult.rows.length === 0) {
      console.log(
        "📋 No tables found in public schema (expected for new project)"
      );
    } else {
      console.log("📋 Existing tables:");
      tablesResult.rows.forEach((row) => console.log(`  - ${row.table_name}`));
    }
  } catch (error) {
    console.log("❌ Connection failed!");
    console.log("📋 Error Details:");
    console.log(`   Code: ${error.code}`);
    console.log(`   Message: ${error.message}`);

    if (error.code === "ENOTFOUND") {
      console.log("🌐 This suggests a DNS resolution issue");
    } else if (error.code === "ECONNREFUSED") {
      console.log(
        "🚫 This suggests the server is not accepting connections on port 5432"
      );
    } else if (error.code === "ETIMEDOUT") {
      console.log(
        "⏱️  This suggests a network timeout - possibly firewall blocking"
      );
    } else if (error.code === "28P01") {
      console.log("🔐 This suggests invalid credentials");
    }

    console.log("");
    console.log("🔧 Troubleshooting suggestions:");
    console.log(
      "   1. Check if you're on a corporate network that blocks port 5432"
    );
    console.log(
      "   2. Try connecting from a different network (mobile hotspot)"
    );
    console.log("   3. Verify the Supabase project is fully provisioned");
    console.log("   4. Check Supabase status page for service issues");
  } finally {
    try {
      await client.end();
      console.log("🔌 Connection closed");
    } catch (e) {
      // Ignore close errors
    }
  }
}

// Run the test
testConnection().catch(console.error);
