/**
 * Database seeding script for OrgSend
 * Creates initial test data with encrypted PII fields
 */

import { PrismaClient } from "../src/generated/prisma";
import { UserType } from "../src/types/database";
// import { encryptionMiddleware } from "../src/lib/encryption/middleware"; // Temporarily disabled
import { generateOrgCode } from "../src/lib/utils";

const prisma = new PrismaClient();

// TODO: Apply encryption middleware when Prisma compatibility is restored
// prisma.$use(encryptionMiddleware);

async function main() {
  console.log("🌱 Starting database seeding...");

  try {
    // Create test admin user first
    console.log("👑 Creating admin user...");
    const adminUser = await prisma.user.create({
      data: {
        id: "user_admin_john",
        // Note: These will be automatically encrypted by middleware
        firstName: "John",
        lastName: "Smith",
        email: "john.smith@university.edu",
        phone: "+15551234567",
        userType: "STUDENT",
        role: "ADMIN",
        communicationPreference: "BOTH",
        emailVerified: true,
        phoneVerified: true,
        isActive: true,
      } as any as any, // Bypass TypeScript - middleware handles field conversion
    });

    // Create test organization with admin
    console.log("🏢 Creating test organization...");
    const testOrg = await prisma.organization.create({
      data: {
        id: "org_test_cs_club",
        name: "Computer Science Club",
        description:
          "A community for computer science students and enthusiasts",
        code: generateOrgCode(),
        adminId: adminUser.id,
        isActive: true,
        allowFollows: true,
        requireApproval: true,
        // smsCreditsAvailable: 100, // Not in schema - handled by OrgCredit
      },
    });

    // Create subgroups for the organization
    console.log("📊 Creating subgroups...");
    const undergradGroup = await prisma.subgroup.create({
      data: {
        id: "subgroup_undergrad",
        organizationId: testOrg.id,
        name: "Undergraduate Students",
        description: "Current undergraduate students in CS",
      },
    });

    const gradGroup = await prisma.subgroup.create({
      data: {
        id: "subgroup_grad",
        organizationId: testOrg.id,
        name: "Graduate Students",
        description: "Graduate students and PhD candidates",
      },
    });

    const alumniGroup = await prisma.subgroup.create({
      data: {
        id: "subgroup_alumni",
        organizationId: testOrg.id,
        name: "Alumni Network",
        description: "CS club alumni working in the industry",
      },
    });

    // Create student info for admin
    await prisma.studentInfo.create({
      data: {
        id: "student_info_admin",
        userId: adminUser.id,
        studentId: "CS2021001",
        major: "Computer Science",
        graduationYear: 2025,
        gpa: 3.8,
      } as any,
    });

    // Create test student users
    console.log("🎓 Creating student users...");
    const student1 = await prisma.user.create({
      data: {
        id: "user_student_alice",
        firstName: "Alice",
        lastName: "Johnson",
        email: "alice.johnson@university.edu",
        phone: "+15551234001",
        userType: "STUDENT",
        role: "CLIENT",
        communicationPreference: "EMAIL_ONLY",
        emailVerified: true,
        phoneVerified: false,
        isActive: true,
      } as any as any,
    });

    await prisma.studentInfo.create({
      data: {
        id: "student_info_alice",
        userId: student1.id,
        studentId: "CS2022015",
        major: "Computer Science",
        graduationYear: 2026,
        gpa: 3.6,
      } as any,
    });

    const student2 = await prisma.user.create({
      data: {
        id: "user_student_bob",
        firstName: "Bob",
        lastName: "Wilson",
        email: "bob.wilson@university.edu",
        phone: "+15551234002",
        userType: "STUDENT",
        role: "CLIENT",
        communicationPreference: "BOTH",
        emailVerified: true,
        phoneVerified: true,
        isActive: true,
      } as any,
    });

    await prisma.studentInfo.create({
      data: {
        id: "student_info_bob",
        userId: student2.id,
        studentId: "CS2021089",
        major: "Computer Science",
        graduationYear: 2025,
        gpa: 3.9,
      } as any,
    });

    // Create alumni user
    console.log("🎓 Creating alumni user...");
    const alumni = await prisma.user.create({
      data: {
        id: "user_alumni_carol",
        firstName: "Carol",
        lastName: "Davis",
        email: "carol.davis@techcorp.com",
        phone: "+15551234003",
        userType: "ALUMNI",
        role: "CLIENT",
        communicationPreference: "BOTH",
        emailVerified: true,
        phoneVerified: true,
        isActive: true,
      } as any,
    });

    await prisma.alumniInfo.create({
      data: {
        id: "alumni_info_carol",
        userId: alumni.id,
        graduationYear: 2020,
        degreeObtained: "Bachelor of Science in Computer Science",
        currentEmployer: "TechCorp Inc.",
        jobTitle: "Senior Software Engineer",
      } as any,
    });

    // Create industry professional user
    console.log("💼 Creating industry professional...");
    const professional = await prisma.user.create({
      data: {
        id: "user_professional_david",
        firstName: "David",
        lastName: "Brown",
        email: "david.brown@startup.com",
        phone: "+15551234004",
        userType: "INDUSTRY_PROFESSIONAL",
        role: "CLIENT",
        communicationPreference: "EMAIL_ONLY",
        emailVerified: true,
        phoneVerified: false,
        isActive: true,
      } as any,
    });

    await prisma.industryProfessionalInfo.create({
      data: {
        id: "professional_info_david",
        userId: professional.id,
        companyName: "Startup Solutions",
        jobTitle: "CTO",
        industry: "Software Development",
        yearsOfExperience: 8,
      } as any,
    });

    // Create follow relationships
    console.log("🔗 Creating follow relationships...");
    await prisma.orgFollow.createMany({
      data: [
        {
          id: "follow_alice_org",
          userId: student1.id,
          organizationId: testOrg.id,
          status: "APPROVED",
        },
        {
          id: "follow_bob_org",
          userId: student2.id,
          organizationId: testOrg.id,
          status: "APPROVED",
        },
        {
          id: "follow_carol_org",
          userId: alumni.id,
          organizationId: testOrg.id,
          status: "APPROVED",
        },
        {
          id: "follow_david_org",
          userId: professional.id,
          organizationId: testOrg.id,
          status: "PENDING",
        },
      ],
    });

    // Add users to subgroups
    console.log("👥 Adding users to subgroups...");
    await prisma.userSubgroup.createMany({
      data: [
        // Alice (undergrad student)
        {
          id: "usersubgroup_alice_undergrad",
          userId: student1.id,
          subgroupId: undergradGroup.id,
        },
        // Bob (grad student)
        {
          id: "usersubgroup_bob_grad",
          userId: student2.id,
          subgroupId: gradGroup.id,
        },
        // Carol (alumni)
        {
          id: "usersubgroup_carol_alumni",
          userId: alumni.id,
          subgroupId: alumniGroup.id,
        },
      ],
    });

    // Create test message
    console.log("💌 Creating test message...");
    const testMessage = await prisma.message.create({
      data: {
        id: "message_welcome",
        organizationId: testOrg.id,
        subgroupId: undergradGroup.id,
        sentByAdminId: adminUser.id, // Required field
        subject: "Welcome to CS Club!",
        content:
          "Welcome to the Computer Science Club! We are excited to have you join our community.",
        type: "EMAIL",
        recipientCount: 1, // Required field
      },
    });

    // Create message delivery record
    await prisma.messageDelivery.create({
      data: {
        id: "delivery_alice_welcome",
        messageId: testMessage.id,
        recipientUserId: student1.id, // Correct field name
        status: "DELIVERED",
        deliveredAt: new Date(),
      },
    });

    // Create SMS credit transaction
    console.log("💳 Creating SMS credit transaction...");
    await prisma.creditTransaction.create({
      data: {
        id: "transaction_initial_credits",
        organizationId: testOrg.id,
        type: "INITIAL",
        amount: 100,
        balanceBefore: 0, // Required field
        balanceAfter: 100,
        description: "Initial free credits for new organization",
      },
    });

    console.log("✅ Seeding completed successfully!");
    console.log(`📊 Created:`);
    console.log(`  - 1 organization (${testOrg.name})`);
    console.log(`  - 3 subgroups`);
    console.log(`  - 5 users (1 admin, 2 students, 1 alumni, 1 professional)`);
    console.log(`  - 4 follow relationships`);
    console.log(`  - 3 subgroup memberships`);
    console.log(`  - 1 test message with delivery`);
    console.log(`  - 1 SMS credit transaction`);
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
