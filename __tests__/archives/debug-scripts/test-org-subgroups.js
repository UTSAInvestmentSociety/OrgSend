require("dotenv").config();
const { Client } = require("pg");

async function testOrganizationAndSubgroups() {
  console.log("🏢 Testing Organization and Subgroup Operations");
  console.log("===============================================");

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log("✅ Connected to database");

    // Test 1: Create a test organization
    console.log("\n1. Creating test organization...");
    const orgResult = await client.query(
      `
      INSERT INTO organizations (id, name, description, "isActive", "smsCreditsAvailable", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW())
      RETURNING id, name, "isActive", "smsCreditsAvailable"
    `,
      [
        "Encryption Test Org",
        "Testing encryption system functionality",
        true,
        1000,
      ]
    );

    const organization = orgResult.rows[0];
    console.log(`✅ Created organization: ${organization.name}`);
    console.log(`   ID: ${organization.id}`);
    console.log(`   Active: ${organization.isActive}`);
    console.log(`   SMS Credits: ${organization.smsCreditsAvailable}`);

    // Test 2: Create test subgroups
    console.log("\n2. Creating test subgroups...");
    const subgroupsData = [
      ["Web Development Team", "Focus on frontend and backend development"],
      ["Data Science Group", "Machine learning and data analytics"],
      ["Mobile App Team", "iOS and Android development"],
    ];

    const createdSubgroups = [];

    for (const [name, description] of subgroupsData) {
      const subgroupResult = await client.query(
        `
        INSERT INTO subgroups (id, name, description, "organizationId", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW())
        RETURNING id, name, description
      `,
        [name, description, organization.id]
      );

      const subgroup = subgroupResult.rows[0];
      createdSubgroups.push(subgroup);
      console.log(`✅ Created subgroup: ${subgroup.name}`);
      console.log(`   ID: ${subgroup.id}`);
      console.log(`   Description: ${subgroup.description}`);
    }

    // Test 3: Verify relationships
    console.log("\n3. Verifying organization-subgroup relationships...");
    const relationshipCheck = await client.query(
      `
      SELECT 
        o.name as org_name,
        s.name as subgroup_name,
        s.description
      FROM organizations o
      JOIN subgroups s ON s."organizationId" = o.id
      WHERE o.id = $1
      ORDER BY s.name
    `,
      [organization.id]
    );

    console.log(
      `✅ Found ${relationshipCheck.rows.length} subgroups for organization`
    );
    relationshipCheck.rows.forEach((row) => {
      console.log(`   ${row.subgroup_name}: ${row.description}`);
    });

    // Test 4: Test batch operations with multiple records
    console.log("\n4. Testing batch subgroup creation (25 records)...");
    const startTime = Date.now();

    const batchSubgroups = [];
    for (let i = 1; i <= 25; i++) {
      batchSubgroups.push([
        `Batch Subgroup ${i}`,
        `Auto-generated subgroup for testing batch operations - Group ${i}`,
        organization.id,
      ]);
    }

    // Create in batches of 5 for better performance
    const batchSize = 5;
    let totalCreated = 0;

    for (let i = 0; i < batchSubgroups.length; i += batchSize) {
      const batch = batchSubgroups.slice(i, i + batchSize);

      for (const [name, description, orgId] of batch) {
        await client.query(
          `
          INSERT INTO subgroups (id, name, description, "organizationId", "createdAt", "updatedAt")
          VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW())
        `,
          [name, description, orgId]
        );
        totalCreated++;
      }

      console.log(
        `✅ Batch ${Math.floor(i / batchSize) + 1}: Created ${batch.length} subgroups`
      );
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`✅ Batch operation completed in ${duration}ms`);
    console.log(
      `✅ Average time per subgroup: ${(duration / totalCreated).toFixed(2)}ms`
    );
    console.log(`✅ Total subgroups created: ${totalCreated}`);

    // Test 5: Verify total count
    console.log("\n5. Verifying total subgroup count...");
    const countResult = await client.query(
      `
      SELECT COUNT(*) as total_subgroups
      FROM subgroups 
      WHERE "organizationId" = $1
    `,
      [organization.id]
    );

    const totalSubgroups = parseInt(countResult.rows[0].total_subgroups);
    console.log(`✅ Total subgroups in organization: ${totalSubgroups}`);
    console.log(`   Expected: ${3 + 25} (3 manual + 25 batch)`);

    if (totalSubgroups === 28) {
      console.log(`✅ Subgroup count matches expected total`);
    } else {
      console.log(`⚠️  Subgroup count mismatch`);
    }

    // Test 6: Performance check - retrieve all subgroups
    console.log("\n6. Testing subgroup retrieval performance...");
    const retrievalStart = Date.now();

    const allSubgroups = await client.query(
      `
      SELECT id, name, description, "createdAt"
      FROM subgroups 
      WHERE "organizationId" = $1
      ORDER BY "createdAt"
    `,
      [organization.id]
    );

    const retrievalEnd = Date.now();
    const retrievalDuration = retrievalEnd - retrievalStart;

    console.log(
      `✅ Retrieved ${allSubgroups.rows.length} subgroups in ${retrievalDuration}ms`
    );

    if (retrievalDuration < 1000) {
      console.log(`✅ Retrieval performance acceptable (< 1s)`);
    } else {
      console.log(`⚠️  Retrieval performance concern (> 1s)`);
    }

    // Cleanup - Remove test data
    console.log("\n7. Cleaning up test data...");

    // Delete all subgroups for this organization
    const deleteSubgroupsResult = await client.query(
      `
      DELETE FROM subgroups WHERE "organizationId" = $1
    `,
      [organization.id]
    );

    // Delete the organization
    const deleteOrgResult = await client.query(
      `
      DELETE FROM organizations WHERE id = $1
    `,
      [organization.id]
    );

    console.log(`✅ Deleted ${deleteSubgroupsResult.rowCount} subgroups`);
    console.log(`✅ Deleted ${deleteOrgResult.rowCount} organization`);

    return {
      success: true,
      organizationId: organization.id,
      subgroupsCreated: totalSubgroups,
      batchDuration: duration,
      retrievalDuration: retrievalDuration,
    };
  } catch (error) {
    console.error("\n❌ Organization/Subgroup test failed:");
    console.error(error.message);
    return { success: false, error: error.message };
  } finally {
    await client.end();
    console.log("✅ Disconnected from database");
  }
}

// Run the test
testOrganizationAndSubgroups()
  .then((result) => {
    if (result.success) {
      console.log("\n🎉 Organization and Subgroup Test Complete!");
      console.log("==========================================");
      console.log(`Organization tested: 1`);
      console.log(`Subgroups created: ${result.subgroupsCreated}`);
      console.log(`Batch creation time: ${result.batchDuration}ms`);
      console.log(`Retrieval time: ${result.retrievalDuration}ms`);
    } else {
      console.log("\n❌ Test failed:", result.error);
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error("Test execution failed:", error);
    process.exit(1);
  });
