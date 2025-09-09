#!/bin/bash

# Script to swap between working and broken test versions for Datadog CI Test Optimization labs
# Usage: ./swap-tests.sh <test-path> <break|fix>
# Example: ./swap-tests.sh integration/post-comment.test.ts break

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
TEST_DIR="../src/__tests__"
BROKEN_DIR="."
BACKUP_DIR="$TEST_DIR/backups"

# Arguments
TEST_PATH=$1
ACTION=$2

# Function to print usage
print_usage() {
    echo "Usage: $0 <test-path> <break|fix|backup|list>"
    echo ""
    echo "Actions:"
    echo "  break   - Replace working test with broken version"
    echo "  fix     - Restore working test from backup"
    echo "  backup  - Create backup of current working test"
    echo "  list    - List available broken tests"
    echo ""
    echo "Examples:"
    echo "  $0 integration/post-comment.test.ts break"
    echo "  $0 components/Header.test.tsx fix"
    echo "  $0 integration/user-registration.test.ts backup"
    echo "  $0 list"
}

# Function to list available broken tests
list_tests() {
    echo -e "${YELLOW}Available broken tests:${NC}"
    echo ""
    if [ -d "$BROKEN_DIR" ]; then
        find "$BROKEN_DIR" -maxdepth 3 -type f \( -name "*.test.ts" -o -name "*.test.tsx" \) | while read -r file; do
            # Remove the broken-tests/ prefix for display
            test_name=${file#./}
            
            # Check if working version exists
            if [ -f "$TEST_DIR/$test_name" ]; then
                echo -e "  ${GREEN}✓${NC} $test_name (has working counterpart)"
            else
                echo -e "  ${RED}✗${NC} $test_name (standalone broken test)"
            fi
        done
    else
        echo -e "${RED}Broken tests directory not found!${NC}"
        exit 1
    fi
}

# Check for list action first
if [ "$1" = "list" ]; then
    list_tests
    exit 0
fi

# Validate arguments
if [ -z "$TEST_PATH" ] || [ -z "$ACTION" ]; then
    print_usage
    exit 1
fi

# Ensure paths don't have leading/trailing slashes
TEST_PATH=${TEST_PATH#/}
TEST_PATH=${TEST_PATH%/}

# Construct full paths
WORKING_TEST="$TEST_DIR/$TEST_PATH"
BROKEN_TEST="$BROKEN_DIR/$TEST_PATH"
BACKUP_TEST="$BACKUP_DIR/${TEST_PATH}.backup"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR/$(dirname "$TEST_PATH")"

# Function to create backup
create_backup() {
    if [ -f "$WORKING_TEST" ]; then
        cp "$WORKING_TEST" "$BACKUP_TEST"
        echo -e "${GREEN}✓${NC} Backup created: $BACKUP_TEST"
        return 0
    else
        echo -e "${RED}✗${NC} Working test not found: $WORKING_TEST"
        return 1
    fi
}

# Execute action
case "$ACTION" in
    "break")
        # Check if broken version exists
        if [ ! -f "$BROKEN_TEST" ]; then
            echo -e "${RED}✗${NC} Broken test not found: $BROKEN_TEST"
            echo ""
            echo "Available broken tests:"
            list_tests
            exit 1
        fi
        
        # Create backup if it doesn't exist
        if [ ! -f "$BACKUP_TEST" ]; then
            echo -e "${YELLOW}Creating backup first...${NC}"
            if ! create_backup; then
                echo -e "${RED}Failed to create backup. Aborting.${NC}"
                exit 1
            fi
        fi
        
        # Copy broken test to working location
        cp "$BROKEN_TEST" "$WORKING_TEST"
        echo -e "${RED}✗${NC} Replaced with broken version: $TEST_PATH"
        echo -e "${YELLOW}Run 'npm test -- $(basename "$TEST_PATH" .ts).test' to see failures${NC}"
        ;;
        
    "fix")
        # Check if backup exists
        if [ ! -f "$BACKUP_TEST" ]; then
            echo -e "${RED}✗${NC} Backup not found: $BACKUP_TEST"
            echo -e "${YELLOW}Try running '$0 $TEST_PATH backup' first${NC}"
            exit 1
        fi
        
        # Restore from backup
        cp "$BACKUP_TEST" "$WORKING_TEST"
        echo -e "${GREEN}✓${NC} Restored working version: $TEST_PATH"
        ;;
        
    "backup")
        if create_backup; then
            echo -e "${GREEN}Successfully backed up $TEST_PATH${NC}"
        else
            exit 1
        fi
        ;;
        
    *)
        echo -e "${RED}Invalid action: $ACTION${NC}"
        echo ""
        print_usage
        exit 1
        ;;
esac

exit 0