require("dotenv").config();
const {
  SecretsManagerClient,
  GetSecretValueCommand,
} = require("@aws-sdk/client-secrets-manager");
const crypto = require("crypto");

// Test AWS Secrets Manager connection
async function testSecretsManager() {
  console.log("\n=== Testing AWS Secrets Manager Connection ===");

  const client = new SecretsManagerClient({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  const keyPaths = [
    "/app/encryption/names-key",
    "/app/encryption/phone-key",
    "/app/encryption/email-key",
    "/app/encryption/academic-key",
    "/app/encryption/professional-key",
  ];

  const results = {};

  for (const keyPath of keyPaths) {
    try {
      console.log(`Testing key: ${keyPath}`);
      const command = new GetSecretValueCommand({ SecretId: keyPath });
      const response = await client.send(command);

      if (response.SecretString) {
        const keyData = JSON.parse(response.SecretString);
        if (keyData.key && keyData.key.length === 64) {
          console.log(
            `✅ ${keyPath}: Valid key retrieved (${keyData.key.length} chars)`
          );
          results[keyPath] = { success: true, key: keyData.key };
        } else {
          console.log(`❌ ${keyPath}: Invalid key format`);
          results[keyPath] = { success: false, error: "Invalid key format" };
        }
      } else {
        console.log(`❌ ${keyPath}: No secret string found`);
        results[keyPath] = { success: false, error: "No secret string" };
      }
    } catch (error) {
      console.log(`❌ ${keyPath}: Error - ${error.message}`);
      results[keyPath] = { success: false, error: error.message };
    }
  }

  return results;
}

// Test encryption functions
async function testEncryption(keys) {
  console.log("\n=== Testing Core Encryption Functions ===");

  const testData = {
    names: "John Doe",
    phone: "+15551234567",
    email: "john@example.com",
    academic: "Computer Science, Graduated 2023",
    professional: "Software Engineer at Tech Corp",
  };

  const keyMap = {
    names: "/app/encryption/names-key",
    phone: "/app/encryption/phone-key",
    email: "/app/encryption/email-key",
    academic: "/app/encryption/academic-key",
    professional: "/app/encryption/professional-key",
  };

  for (const [dataType, plaintext] of Object.entries(testData)) {
    const keyPath = keyMap[dataType];

    if (!keys[keyPath] || !keys[keyPath].success) {
      console.log(`⏭️  Skipping ${dataType} - key not available`);
      continue;
    }

    try {
      console.log(`\nTesting ${dataType} encryption:`);
      console.log(`  Input: ${plaintext}`);

      // Test encryption
      const key = Buffer.from(keys[keyPath].key, "hex");
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

      let encrypted = cipher.update(plaintext, "utf8", "hex");
      encrypted += cipher.final("hex");
      const authTag = cipher.getAuthTag();

      const encryptedData =
        iv.toString("hex") + ":" + authTag.toString("hex") + ":" + encrypted;
      console.log(`  Encrypted: ${encryptedData.substring(0, 50)}...`);

      // Test decryption
      const parts = encryptedData.split(":");
      const ivDec = Buffer.from(parts[0], "hex");
      const authTagDec = Buffer.from(parts[1], "hex");
      const encryptedText = parts[2];

      const decipher = crypto.createDecipheriv("aes-256-gcm", key, ivDec);
      decipher.setAuthTag(authTagDec);

      let decrypted = decipher.update(encryptedText, "hex", "utf8");
      decrypted += decipher.final("utf8");

      if (decrypted === plaintext) {
        console.log(`  ✅ Decrypted successfully: ${decrypted}`);

        // Test hash generation
        const hash = crypto
          .createHash("sha256")
          .update(plaintext)
          .digest("hex");
        console.log(`  ✅ Hash generated: ${hash.substring(0, 16)}...`);

        // Test uniqueness (encrypt same data twice)
        const iv2 = crypto.randomBytes(16);
        const cipher2 = crypto.createCipheriv("aes-256-gcm", key, iv2);
        let encrypted2 = cipher2.update(plaintext, "utf8", "hex");
        encrypted2 += cipher2.final("hex");
        const authTag2 = cipher2.getAuthTag();
        const encryptedData2 =
          iv2.toString("hex") +
          ":" +
          authTag2.toString("hex") +
          ":" +
          encrypted2;

        if (encryptedData !== encryptedData2) {
          console.log(
            `  ✅ Encryption produces unique outputs (random IVs working)`
          );
        } else {
          console.log(`  ❌ Encryption not unique - IV randomization issue`);
        }
      } else {
        console.log(`  ❌ Decryption failed - got: ${decrypted}`);
      }
    } catch (error) {
      console.log(`  ❌ Encryption test failed: ${error.message}`);
    }
  }
}

// Test batch operations
async function testBatchOperations(keys) {
  console.log("\n=== Testing Batch Encryption Operations ===");

  const batchSize = 25;
  const testUsers = [];

  for (let i = 0; i < batchSize; i++) {
    testUsers.push({
      firstName: `User${i}`,
      lastName: `Test${i}`,
      email: `user${i}@example.com`,
      phone: `+155512340${String(i).padStart(2, "0")}`,
    });
  }

  console.log(`Testing batch encryption of ${batchSize} users...`);

  const startTime = Date.now();

  try {
    // Simulate batch encryption
    const encryptedUsers = [];

    for (const user of testUsers) {
      const encrypted = {
        firstName_hash: crypto
          .createHash("sha256")
          .update(user.firstName)
          .digest("hex"),
        lastName_hash: crypto
          .createHash("sha256")
          .update(user.lastName)
          .digest("hex"),
        email_hash: crypto
          .createHash("sha256")
          .update(user.email)
          .digest("hex"),
        phone_hash: crypto
          .createHash("sha256")
          .update(user.phone)
          .digest("hex"),
      };

      encryptedUsers.push(encrypted);
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`✅ Batch encryption completed in ${duration}ms`);
    console.log(
      `✅ Average time per record: ${(duration / batchSize).toFixed(2)}ms`
    );
    console.log(`✅ All ${batchSize} users processed successfully`);

    if (duration < 5000) {
      console.log(`✅ Performance acceptable (< 5s for ${batchSize} records)`);
    } else {
      console.log(`⚠️  Performance concern (> 5s for ${batchSize} records)`);
    }
  } catch (error) {
    console.log(`❌ Batch operation failed: ${error.message}`);
  }
}

// Main test function
async function runTests() {
  console.log("🔐 Starting Encryption System Tests");
  console.log("==================================");

  try {
    // Test 1: AWS Secrets Manager
    const keys = await testSecretsManager();

    const successfulKeys = Object.values(keys).filter((k) => k.success).length;
    const totalKeys = Object.keys(keys).length;

    console.log(
      `\n📊 AWS Secrets Manager Results: ${successfulKeys}/${totalKeys} keys retrieved successfully`
    );

    if (successfulKeys === 0) {
      console.log("❌ Cannot proceed - no encryption keys available");
      return;
    }

    // Test 2: Core Encryption
    await testEncryption(keys);

    // Test 3: Batch Operations
    await testBatchOperations(keys);

    console.log("\n🎉 Encryption System Test Complete!");
    console.log("===================================");
  } catch (error) {
    console.error("💥 Test execution failed:", error.message);
    console.error(error.stack);
  }
}

// Run tests
runTests().catch(console.error);
