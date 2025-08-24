# Convex Database Connection Test

This directory contains test functions and utilities to verify that all apps in the workspace are connected to the same Convex database.

## Overview

The test system consists of:
- **Convex Functions**: Server-side functions for testing database operations
- **Test Script**: Node.js script to run comprehensive tests
- **React Component**: UI component for testing from within apps

## Files

### Convex Functions (`convex/functions/testDatabaseConnection.ts`)

Contains the following functions:

- `testConnection`: Basic connection test that writes a test record
- `getConnectionStatus`: Query to check connection status and see which apps have connected
- `cleanupTestRecords`: Clean up old test records (older than 24 hours by default)
- `runComprehensiveTest`: Full test suite that tests read, write, query, and count operations
- `getDatabaseInfo`: Simple query to get database information

### Schema (`convex/schema.ts`)

Defines the `connectionTests` table used by the test functions.

### Test Script (`scripts/test-convex-connection.js`)

A comprehensive Node.js script that:
- Checks environment files for consistency
- Tests each app's connection to the database
- Verifies all apps are using the same database
- Provides detailed reporting

### React Component (`packages/ui/src/convex-test.tsx`)

A reusable React component that can be imported into any app to test the connection.

## Usage

### 1. Deploy the Functions

First, deploy the Convex functions:

```bash
pnpm convex:deploy
```

### 2. Run the Test Script

From the root directory, run:

```bash
pnpm test:convex
```

This will:
- Check all `.env.local` files for consistency
- Test each app's connection to the database
- Verify all apps are using the same database
- Clean up old test records

### 3. Use the React Component

Import and use the component in any app:

```tsx
import { ConvexTest } from "@repo/ui/convex-test";

// In your component
<ConvexTest appName="web" showDetails={true} />
```

### 4. Manual Testing

You can also test individual functions using the Convex dashboard or CLI:

```bash
# Test a specific app
npx convex run functions:runComprehensiveTest --appName web

# Get connection status
npx convex run functions:getConnectionStatus

# Clean up old tests
npx convex run functions:cleanupTestRecords
```

## Expected Results

When all apps are properly connected to the same database, you should see:

1. **Environment Files**: All `.env.local` files should have the same `CONVEX_URL` and `CONVEX_DEPLOYMENT`
2. **Database Name**: All tests should return the same database name
3. **Connection Status**: All apps should successfully perform read/write operations
4. **Test Results**: All database operations (write, read, query, count) should succeed

## Troubleshooting

### Common Issues

1. **Different Database URLs**: Check that all `.env.local` files have the same `CONVEX_URL`
2. **Missing Environment Variables**: Ensure `CONVEX_URL` and `CONVEX_DEPLOYMENT` are set
3. **Deployment Issues**: Make sure the functions are deployed with `pnpm convex:deploy`
4. **Network Issues**: Check if the Convex deployment is accessible

### Debug Steps

1. Check environment files:
   ```bash
   cat .env.local
   cat apps/web/.env.local
   cat apps/mcp/.env.local
   cat apps/docs/.env.local
   ```

2. Verify deployment:
   ```bash
   pnpm convex:deploy
   ```

3. Test individual functions:
   ```bash
   npx convex run functions:getDatabaseInfo
   ```

## Database Schema

The test system uses a `connectionTests` table with the following structure:

```typescript
{
  appName: string,        // Name of the app (web, mcp, docs)
  timestamp: number,      // Unix timestamp
  testData: string,       // Optional test data
  createdAt: string,      // ISO timestamp
  testType: string        // Type of test (basic, comprehensive)
}
```

## Cleanup

The test system automatically cleans up old test records (older than 24 hours). You can manually clean up with:

```bash
npx convex run functions:cleanupTestRecords --olderThanHours 1
```

## Integration

To integrate this into your CI/CD pipeline, add the test script to your workflow:

```yaml
- name: Test Convex Connection
  run: pnpm test:convex
```

This will ensure all apps are properly connected to the same database before deployment.
