# OrgSend Database Schema

## Overview

Complete database schema implementation with encrypted PII fields, comprehensive relationships, and business logic enforcement for the Student Organization Management Platform.

## Schema Summary

### 🔒 Security Features

- **Encrypted PII Fields**: All personally identifiable information is encrypted using AES-256-GCM
- **Hash-based Constraints**: SHA-256 hashes enable unique constraints and searchable lookups
- **No Plaintext Storage**: Original PII never stored in database
- **TCPA Compliance**: SMS opt-out tracking for regulatory compliance

### 📊 Core Models

#### User Model

- **Encrypted Fields**: firstName, lastName, email, phone, phoneVerificationCode
- **Roles**: CLIENT, ADMIN, SUPER_ADMIN
- **Verification**: Email and phone verification flows
- **Relationships**: Can admin multiple organizations, follow organizations

#### Organization Model

- **Unique Codes**: 8-character alphanumeric codes for joining
- **Admin System**: One admin per organization
- **Credit System**: SMS credits with transaction tracking
- **Followers**: Approved/pending follow requests

#### Follow System (OrgFollow)

- **Status Flow**: PENDING → APPROVED/REJECTED
- **Join Methods**: BROWSE, CODE, LINK tracking
- **Admin Approval**: Required for all follow requests

#### SMS Credit System

- **OrgCredit**: Balance, totals, usage tracking
- **CreditTransaction**: Complete audit trail
- **Transaction Types**: INITIAL, PURCHASE, USAGE, ADJUSTMENT, REFUND

#### Message System

- **Types**: EMAIL, SMS
- **Tracking**: Individual delivery status per recipient
- **Credit Calculation**: Pre-send credit estimation
- **Delivery Status**: SENT, DELIVERED, FAILED, BOUNCED, PENDING

#### Compliance

- **SmsOptOut**: Phone-based opt-out tracking
- **SystemConfig**: Platform configuration management

### 🔐 Encryption Integration

All PII fields follow the pattern:

```prisma
// Original field (never stored)
fieldName_encrypted String  // AES-256-GCM encrypted data
fieldName_hash     String  // SHA-256 hash for constraints/lookup
```

Integrated with encryption middleware for transparent operation:

```typescript
import { encryptionMiddleware } from "../encryption/middleware";
prisma.$use(encryptionMiddleware);
```

### 🚀 Key Features

#### Automatic Encryption

- All PII encrypted before database storage
- Transparent decryption on data retrieval
- Batch operation support (25-50 records)

#### Business Logic Enforcement

- SMS credit validation and tracking
- Follow request approval workflows
- Message delivery tracking
- TCPA compliance opt-out management

#### Relationship Integrity

- Foreign key constraints with appropriate cascade behaviors
- Composite unique constraints (e.g., user-organization follows)
- One-to-one relationships (organization credits)

### 📋 Database Operations

Pre-built operation utilities in `operations.ts`:

#### User Operations

- `findByEmail(email)` - Hash-based email lookup
- `findByPhone(phone)` - Hash-based phone lookup
- `create(userData)` - Create with automatic encryption
- `verifyPhone(userId)` - Mark phone as verified
- `getFollowers(organizationId)` - Get approved followers

#### Organization Operations

- `findByCode(code)` - Find by unique organization code
- `create(orgData)` - Create with initial credits
- `hasCredits(orgId, amount)` - Check credit balance
- `useCredits(orgId, amount, messageId, adminId)` - Deduct credits

#### Follow Operations

- `createRequest(userId, orgId, method)` - Create follow request
- `approve(followId, adminId)` - Approve follow request
- `reject(followId, reason)` - Reject follow request
- `isFollowing(userId, orgId)` - Check follow status

#### Message Operations

- `create(messageData)` - Create with recipient calculation
- `getHistory(orgId, limit)` - Get message history

### 🌱 Database Seeding

Comprehensive seeding script (`prisma/seed.ts`) creates:

- Super admin user
- 3 test organizations with admins
- 4 client users
- Follow relationships with various statuses
- Sample messages with delivery tracking
- Credit transactions and balances
- System configuration entries

### ✅ Testing

#### Schema Tests (`schema.test.ts`)

- PII field encryption pattern validation
- Enum value verification
- Relationship structure validation
- Unique constraint testing
- Security validation (no plaintext PII)

#### Operations Tests (`operations.test.ts`)

- Hash-based lookups
- Encrypted field creation
- Credit transaction workflows
- Follow request management
- Message creation with recipient calculation

### 🎯 Success Criteria Met

- ✅ All BRD models implemented with proper relationships
- ✅ Encrypted field patterns consistent across all PII
- ✅ Database generates and validates successfully
- ✅ All enums and constraints properly defined
- ✅ Encryption middleware integrated
- ✅ Unique constraints work with hash fields
- ✅ Comprehensive test suite (24+ tests)
- ✅ Seeding creates realistic test data
- ✅ Operation utilities for common workflows

### 📦 Files Created

```
prisma/
├── schema.prisma          # Complete database schema
└── seed.ts               # Database seeding script

src/lib/database/
├── client.ts             # Prisma client with encryption
├── operations.ts         # Database operation utilities
├── operations.test.ts    # Operation testing
├── schema.test.ts        # Schema validation tests
└── README.md            # This documentation
```

### 🔄 Next Steps

The database schema is ready for:

1. **Authentication System** (Feature 4) - User registration/login
2. **Message Sending** - Email and SMS delivery
3. **Admin Dashboard** - Organization management
4. **Production Deployment** - With encrypted data

All database operations will automatically handle PII encryption/decryption transparently through the middleware integration.
