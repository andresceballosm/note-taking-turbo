#!/bin/bash

# API Testing Script for Note Taking API
# This script tests all the main endpoints

BASE_URL="http://localhost:8000"
EMAIL="demo@example.com"
PASSWORD="DemoPass123!"

echo "============================================"
echo "Note Taking API - Testing Script"
echo "============================================"
echo ""

# 1. Register a new user
echo "1. Testing User Registration..."
REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"password2\": \"$PASSWORD\",
    \"first_name\": \"Demo\",
    \"last_name\": \"User\"
  }")

echo "Response: $REGISTER_RESPONSE"
echo ""

# 2. Login to get JWT tokens
echo "2. Testing User Login..."
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}")

echo "Response: $LOGIN_RESPONSE"

# Extract access token
ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access":"[^"]*' | cut -d'"' -f4)

if [ -z "$ACCESS_TOKEN" ]; then
    echo "❌ Failed to get access token. Stopping tests."
    exit 1
fi

echo "✓ Access token obtained"
echo ""

# 3. Get current user details
echo "3. Testing Get User Details..."
curl -s -X GET $BASE_URL/api/auth/me/ \
  -H "Authorization: Bearer $ACCESS_TOKEN" | python3 -m json.tool
echo ""

# 4. Create a note
echo "4. Testing Create Note (School category)..."
NOTE1=$(curl -s -X POST $BASE_URL/api/notes/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{"title": "Math Homework", "content": "Complete chapters 5 and 6", "category": "School"}')

echo "Response: $NOTE1"
NOTE1_ID=$(echo $NOTE1 | grep -o '"id":[0-9]*' | cut -d':' -f2 | head -1)
echo ""

# 5. Create another note
echo "5. Testing Create Note (Personal category)..."
curl -s -X POST $BASE_URL/api/notes/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{"title": "Grocery List", "content": "Milk, Bread, Eggs", "category": "Personal"}' | python3 -m json.tool
echo ""

# 6. Create a third note
echo "6. Testing Create note (Random Thoughts category)..."
curl -s -X POST $BASE_URL/api/notes/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{"title": "Idea for App", "content": "Create a note-taking app with categories", "category": "Random Thoughts"}' | python3 -m json.tool
echo ""

# 7. List all notes
echo "7. Testing List All Notes..."
curl -s -X GET $BASE_URL/api/notes/ \
  -H "Authorization: Bearer $ACCESS_TOKEN" | python3 -m json.tool
echo ""

# 8. Get specific note
if [ ! -z "$NOTE1_ID" ]; then
    echo "8. Testing Get Single Note (ID: $NOTE1_ID)..."
    curl -s -X GET $BASE_URL/api/notes/$note1_ID/ \
      -H "Authorization: Bearer $ACCESS_TOKEN" | python3 -m json.tool
    echo ""
fi

# 9. Update note
if [ ! -z "$NOTE1_ID" ]; then
    echo "9. Testing Update Note (ID: $NOTE1_ID)..."
    curl -s -X PUT $BASE_URL/api/notes/$NOTE1_ID/ \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $ACCESS_TOKEN" \
      -d '{"title": "Math Homework - UPDATED", "content": "Complete chapters 5, 6, and 7", "category": "School"}' | python3 -m json.tool
    echo ""
fi

# 10. Search notes
echo "10. Testing Search Notes (query: 'homework')..."
curl -s -X GET "$BASE_URL/api/notes/?search=homework" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | python3 -m json.tool
echo ""

# 11. Delete note
if [ ! -z "$NOTE1_ID" ]; then
    echo "11. Testing Delete Note (ID: $NOTE1_ID)..."
    DELETE_RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE $BASE_URL/api/notes/$NOTE1_ID/ \
      -H "Authorization: Bearer $ACCESS_TOKEN")

    HTTP_CODE=$(echo "$DELETE_RESPONSE" | tail -n 1)

    if [ "$HTTP_CODE" == "204" ]; then
        echo "✓ Note deleted successfully (HTTP 204)"
    else
        echo "❌ Failed to delete note (HTTP $HTTP_CODE)"
    fi
    echo ""
fi

# 12. Verify deletion
echo "12. Testing List All Notes (after deletion)..."
curl -s -X GET $BASE_URL/api/notes/ \
  -H "Authorization: Bearer $ACCESS_TOKEN" | python3 -m json.tool
echo ""

echo "============================================"
echo "✓ All tests completed!"
echo "============================================"
