#!/bin/bash

# Test Script for NestJS Backend
# This script validates that the backend is working correctly

set -e  # Exit on error

echo "🧪 NestJS Backend Test Script"
echo "=============================="
echo ""

BASE_URL="http://localhost:3000/api/v1"
TOKEN=""
USER_ID=""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

function test_passed() {
    echo -e "${GREEN}✓ $1${NC}"
}

function test_failed() {
    echo -e "${RED}✗ $1${NC}"
    exit 1
}

function test_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check if backend is running
echo "Checking if backend is running..."
if ! curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/../healthz" | grep -q "200"; then
    test_failed "Backend is not running. Please start it with: cd backend && npm run start:dev"
fi
test_passed "Backend is running"
echo ""

# Test 1: Sign Up
echo "Test 1: Sign Up"
SIGNUP_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser_'$(date +%s)'","password":"test123456","nickname":"Test User"}')

if echo "$SIGNUP_RESPONSE" | grep -q "accessToken"; then
    TOKEN=$(echo "$SIGNUP_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
    USER_ID=$(echo "$SIGNUP_RESPONSE" | grep -o '"id":[0-9]*' | cut -d':' -f2 | head -1)
    test_passed "Sign up successful (User ID: $USER_ID)"
else
    test_failed "Sign up failed: $SIGNUP_RESPONSE"
fi
echo ""

# Test 2: Get Current User
echo "Test 2: Get Current User"
ME_RESPONSE=$(curl -s -X GET "$BASE_URL/auth/me" \
  -H "Authorization: ******)

if echo "$ME_RESPONSE" | grep -q "username"; then
    test_passed "Get current user successful"
else
    test_failed "Get current user failed: $ME_RESPONSE"
fi
echo ""

# Test 3: Create Memo
echo "Test 3: Create Memo"
MEMO_RESPONSE=$(curl -s -X POST "$BASE_URL/memos" \
  -H "Authorization: ******" \
  -H "Content-Type: application/json" \
  -d '{"content":"Test memo from automated test","visibility":"PRIVATE"}')

if echo "$MEMO_RESPONSE" | grep -q "content"; then
    MEMO_ID=$(echo "$MEMO_RESPONSE" | grep -o '"id":[0-9]*' | cut -d':' -f2)
    test_passed "Create memo successful (Memo ID: $MEMO_ID)"
else
    test_failed "Create memo failed: $MEMO_RESPONSE"
fi
echo ""

# Test 4: List Memos
echo "Test 4: List Memos"
LIST_RESPONSE=$(curl -s -X GET "$BASE_URL/memos" \
  -H "Authorization: ******)

if echo "$LIST_RESPONSE" | grep -q "memos"; then
    test_passed "List memos successful"
else
    test_failed "List memos failed: $LIST_RESPONSE"
fi
echo ""

# Test 5: Update Memo
echo "Test 5: Update Memo"
UPDATE_RESPONSE=$(curl -s -X PATCH "$BASE_URL/memos/$MEMO_ID" \
  -H "Authorization: ******" \
  -H "Content-Type: application/json" \
  -d '{"content":"Updated test memo","pinned":true}')

if echo "$UPDATE_RESPONSE" | grep -q "Updated"; then
    test_passed "Update memo successful"
else
    test_failed "Update memo failed: $UPDATE_RESPONSE"
fi
echo ""

# Test 6: Create Access Token
echo "Test 6: Create Access Token"
ACCESS_TOKEN_RESPONSE=$(curl -s -X POST "$BASE_URL/users/$USER_ID/access-tokens" \
  -H "Authorization: ******" \
  -H "Content-Type: application/json" \
  -d '{"description":"Test API Token"}')

if echo "$ACCESS_TOKEN_RESPONSE" | grep -q "token"; then
    test_passed "Create access token successful"
else
    test_failed "Create access token failed: $ACCESS_TOKEN_RESPONSE"
fi
echo ""

# Test 7: List Access Tokens
echo "Test 7: List Access Tokens"
LIST_TOKENS_RESPONSE=$(curl -s -X GET "$BASE_URL/users/$USER_ID/access-tokens" \
  -H "Authorization: ******)

if echo "$LIST_TOKENS_RESPONSE" | grep -q "token"; then
    test_passed "List access tokens successful"
else
    test_failed "List access tokens failed: $LIST_TOKENS_RESPONSE"
fi
echo ""

# Test 8: Get Workspace Profile
echo "Test 8: Get Workspace Profile"
WORKSPACE_RESPONSE=$(curl -s -X GET "$BASE_URL/workspace/profile")

if echo "$WORKSPACE_RESPONSE" | grep -q "name"; then
    test_passed "Get workspace profile successful"
else
    test_failed "Get workspace profile failed: $WORKSPACE_RESPONSE"
fi
echo ""

# Test 9: Parse Markdown
echo "Test 9: Parse Markdown"
MARKDOWN_RESPONSE=$(curl -s -X POST "$BASE_URL/markdown/parse" \
  -H "Content-Type: application/json" \
  -d '{"content":"# Hello World\nThis is **bold** text"}')

if echo "$MARKDOWN_RESPONSE" | grep -q "content"; then
    test_passed "Parse markdown successful"
else
    test_failed "Parse markdown failed: $MARKDOWN_RESPONSE"
fi
echo ""

# Test 10: Delete Memo
echo "Test 10: Delete Memo"
DELETE_RESPONSE=$(curl -s -X DELETE "$BASE_URL/memos/$MEMO_ID" \
  -H "Authorization: ******)

if echo "$DELETE_RESPONSE" | grep -q "success\|deleted"; then
    test_passed "Delete memo successful"
else
    test_failed "Delete memo failed: $DELETE_RESPONSE"
fi
echo ""

echo "=============================="
echo -e "${GREEN}🎉 All tests passed!${NC}"
echo ""
echo "Summary:"
echo "  - Authentication: Working ✓"
echo "  - User Management: Working ✓"
echo "  - Memo CRUD: Working ✓"
echo "  - Access Tokens: Working ✓"
echo "  - Workspace: Working ✓"
echo "  - Markdown: Working ✓"
echo ""
echo "Backend is fully functional and ready for use!"
