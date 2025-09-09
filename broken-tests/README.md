# Broken Tests Directory

This directory contains intentionally broken or flaky tests designed for Datadog CI Test Optimization demonstrations and training labs.

## Purpose

These tests are separated from the main test suite to:
- Prevent CI/CD pipeline failures in production
- Provide controlled examples of test failures and flakiness
- Demonstrate Datadog's test visibility and debugging features
- Allow instructors to selectively introduce issues during labs

## Test Files

### Tests with Working Counterparts

These tests have functioning versions in `src/__tests__/` and can be swapped during labs:

| Broken Test | Working Version | Type of Issues |
|------------|-----------------|----------------|
| `integration/post-comment.test.ts` | `src/__tests__/integration/post-comment.test.ts` | Race conditions, state persistence |
| `integration/db-connection.test.ts` | `src/__tests__/integration/db-connection.test.ts` | Connection timeouts, retry logic |
| `integration/user-registration.test.ts` | `src/__tests__/integration/user-registration.test.ts` | Concurrent registration conflicts |
| `components/Header.test.tsx` | `src/__tests__/components/Header.test.tsx` | Component rendering issues |
| `components/PostList.test.tsx` | `src/__tests__/components/PostList.test.tsx` | Async data loading problems |

### Standalone Broken Tests

These tests exist only as broken examples without working counterparts:

| Test File | Description |
|----------|-------------|
| `integration/quotes-api.test.ts` | Demonstrates API timeout and network issues |
| `components/SignUpForm.test.tsx` | Shows form validation flakiness |

## Using in Labs

### Integrating Broken Tests

1. **Backup working tests first:**
   ```bash
   # Create backup directory
   mkdir -p src/__tests__/backups
   
   # Backup specific test
   cp src/__tests__/integration/post-comment.test.ts \
      src/__tests__/backups/post-comment.test.ts.backup
   
   # Or backup all tests
   cp -r src/__tests__/* src/__tests__/backups/
   ```

2. **Replace with broken version:**
   ```bash
   # Copy broken test to active test directory
   cp broken-tests/integration/post-comment.test.ts \
      src/__tests__/integration/post-comment.test.ts
   ```

3. **Run tests to see failures:**
   ```bash
   npm test
   # or for specific test
   npm test -- post-comment.test.ts
   ```

### Restoring Working Tests

```bash
# Restore from backup
cp src/__tests__/backups/post-comment.test.ts.backup \
   src/__tests__/integration/post-comment.test.ts

# Or restore all
cp -r src/__tests__/backups/* src/__tests__/
```

### Automated Swap Script

For convenience during labs, you can create a swap script:

```bash
#!/bin/bash
# swap-tests.sh

TEST_NAME=$1
ACTION=$2  # "break" or "fix"

if [ "$ACTION" = "break" ]; then
  cp broken-tests/$TEST_NAME src/__tests__/$TEST_NAME
  echo "✗ Replaced with broken version: $TEST_NAME"
elif [ "$ACTION" = "fix" ]; then
  cp src/__tests__/backups/${TEST_NAME}.backup src/__tests__/$TEST_NAME
  echo "✓ Restored working version: $TEST_NAME"
else
  echo "Usage: ./swap-tests.sh <test-path> <break|fix>"
fi
```

## Types of Issues Demonstrated

### Flaky Tests
- **Race Conditions**: Tests that fail intermittently due to timing issues
- **State Persistence**: Tests that fail when database state isn't properly reset
- **Network Timeouts**: Tests that fail due to external service dependencies

### Consistently Failing Tests
- **Assertion Errors**: Incorrect expectations
- **Setup/Teardown Issues**: Missing or incorrect test setup
- **Dependency Problems**: Missing mocks or stubs

## Notes

- These tests are excluded from the main test run via `jest.config.cjs`
- The `broken-tests/` directory is in `.gitignore` to prevent accidental commits
- Each broken test includes comments explaining the intentional issues
- Some tests may require database reseeding between runs

## Datadog Features to Highlight

When using these broken tests, emphasize:
- Test flakiness detection
- Test performance monitoring
- Failure analysis and stack traces
- Test session replay
- Intelligent test runner optimizations
- Git blame integration for failure attribution